<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\DatabaseController;

Route::get('/', function () {
    return Inertia::render('App');
});

Route::post('/api/query', [DatabaseController::class, 'runQuery']);
Route::get('/export/{table}', [DatabaseController::class, 'exportTableToJson']);
Route::get('/api/tables', [DatabaseController::class, 'listTables']);
Route::get('/export-all/{table}', [DatabaseController::class, 'exportTableAll']);
Route::get('/api/table-columns/{table}', [DatabaseController::class, 'getTableColumns']);
Route::get('/api/yajra-table/{tableName}', [DatabaseController::class, 'yajraTable']);
