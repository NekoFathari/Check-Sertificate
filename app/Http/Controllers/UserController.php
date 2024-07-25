<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Maatwebsite\Excel\Facades\Excel;
use App\Imports\ExcelImport;

class UserController extends Controller
{
    public function index()
    {
        $check = Auth::check();
        if ($check) {
            $getusername = Auth::user()->username;
            return redirect()->route('home')->with('success','Selamat Datang ' . $getusername . ',');
            
        } else {
            return view('login');
        }
    }
    public function login_proses(Request $request)
    {
        $request->validate([
            'email' => 'required',
            'password' => 'required',
        ]);

        $data = [
            'email' => $request->email,
            'password' => $request->password,
        ];

        if(Auth::attempt($data)){
            return redirect()->route('home');
        }else{
            return redirect()->route('login')->with('error', 'Email atau Password salah');
        }
    } 

    public function logout()
    {
        Auth::logout();
        return redirect()->route('login');

    }

    public function import(request $request)
    {
        Excel::import(new ExcelImport, $request->file('file'));
    }
}
