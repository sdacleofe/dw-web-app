<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schema;

class DatabaseController extends Controller
{
    public function exportTableToJson(Request $request, $tableName)
    {
        $columns = $request->query('columns');
        if ($columns) {
            $columnsArr = explode(',', $columns);
            $rows = DB::table($tableName)->select($columnsArr)->paginate(30);
        } else {
            $rows = DB::table($tableName)->paginate(100);
        }
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

    public function getTableColumns($table)
    {
        $columns = Schema::getColumnListing($table);
        return response()->json($columns);
    }

    public function runQuery(Request $request)
    {
        $sql = $request->input('query');
        $selectedTable = $request->input('table');

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

            $data = DB::select($sql, []);

            $rows = array_map(fn($row) => (array)$row, $data);
            return response()->json([
                'data' => $rows,
                'headers' => count($rows) ? array_keys($rows[0]) : [],
                'total' => count($rows),
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
