<?php

namespace App\Http\Controllers;

use App\Models\Jutsu;
use Illuminate\Http\Request;

class JutsuController extends Controller
{
    public function index()
    {
        $jutsu = Jutsu::all();
        return response()->json($jutsu);
    }

    public function show($id)
    {
        $jutsu = Jutsu::findOrFail($id);
        return response()->json($jutsu);
    }
}