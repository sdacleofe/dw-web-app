<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class DatabaseController extends Controller
{
    public function exportTableToJson($tableName)
    {
        $rows = DB::table($tableName)->paginate(100);

        return response()->json($rows);
    }

    public function listTables()
    {
        $tables = DB::select("
        SELECT tablename
        FROM pg_catalog.pg_tables
        WHERE schemaname NOT IN ('pg_catalog', 'information_schema')
        AND tablename != 'sessions'
        ORDER BY tablename
    ");
        $tableNames = array_map(fn($t) => $t->tablename, $tables);
        return response()->json($tableNames);
    }

    public function runQuery(Request $request)
    {
        $sql = $request->input('query');
        $selectedTable = $request->input('table');
        $perPage = (int)($request->input('per_page') ?? 100);
        $page = (int)($request->input('page') ?? 1);

        try {
            $forbidden = '/\b(update|delete|insert|drop|alter|create|truncate|replace|grant|revoke|join|union|;|--|#|\/\*)\b/i';
            if (!preg_match('/^\s*select\b/i', $sql) || preg_match($forbidden, $sql)) {
                return response()->json(['error' => 'Only simple SELECT queries without JOIN, UNION, or comments are allowed.'], 400);
            }

            preg_match_all('/\bfrom\s+([a-zA-Z0-9_]+)/i', $sql, $matches);
            $tablesInQuery = array_map('strtolower', $matches[1] ?? []);

            if (
                !$selectedTable ||
                count($tablesInQuery) !== 1 ||
                strtolower($selectedTable) !== $tablesInQuery[0]
            ) {
                return response()->json(['error' => 'Query can only reference the selected table.'], 400);
            }

            if (!preg_match('/^\s*select\s+[\*\w,\s`"]+\s+from\s+[a-zA-Z0-9_]+/i', $sql)) {
                return response()->json(['error' => 'Only simple SELECT queries are allowed.'], 400);
            }

            // Count total rows
            $countSql = preg_replace('/^select\s+.+?\s+from\s+/is', 'select count(*) as total from ', $sql, 1);
            $countResult = DB::select($countSql);
            $total = isset($countResult[0]->total) ? (int)$countResult[0]->total : 0;

            // Add LIMIT/OFFSET for pagination
            $offset = ($page - 1) * $perPage;
            $paginatedSql = $sql . " LIMIT $perPage OFFSET $offset";
            $data = DB::select($paginatedSql, []);

            $rows = array_map(fn($row) => (array)$row, $data);
            return response()->json([
                'data' => $rows,
                'headers' => count($rows) ? array_keys($rows[0]) : [],
                'total' => $total,
                'current_page' => $page,
                'last_page' => $perPage > 0 ? (int)ceil($total / $perPage) : 1,
                'per_page' => $perPage,
            ]);
        } catch (\Exception $e) {
            Log::error('Query error: ' . $e->getMessage(), [
                'sql' => $sql ?? null,
                'table' => $selectedTable ?? null,
                'trace' => $e->getTraceAsString(),
            ]);
            return response()->json(['error' => 'An error occurred while executing the query. Please check your SQL and try again.'], 400);
        }
    }

    public function exportTableAll($tableName)
    {
        $query = DB::table($tableName)->select('*');
        $headers = [
            'Content-Type' => 'application/json',
            'Content-Disposition' => 'attachment; filename="' . $tableName . '-all.json"',
        ];

        return response()->stream(function () use ($query) {
            echo '{"data":[';
            $first = true;
            $total = 0;
            $headersArr = [];
            foreach ($query->cursor() as $row) {
                $rowArr = (array)$row;
                if ($first) {
                    $headersArr = array_keys($rowArr);
                }
                if (!$first) {
                    echo ',';
                }
                echo json_encode($rowArr);
                $first = false;
                $total++;
            }
            echo '],';
            echo '"headers":' . json_encode($headersArr) . ',';
            echo '"total":' . $total;
            echo '}';
        }, 200, $headers);
    }
}
