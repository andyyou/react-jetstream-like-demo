<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;

class ApiTokenController extends Controller
{
    public function index(Request $request)
    {
        return Inertia::render('API/Index', [
            'tokens' => $request->user()->tokens,
            'availablePermissions' => ['create', 'delete', 'read', 'update'],
            'defaultPermissions' => ['read'],
        ]);
    }

    public function store(Request $request)
    {
        Validator::make([
            'name' => $request->name,
        ], [
            'name' => ['required', 'string', 'max:255'],
        ])->validateWithBag('createApiToken');

        $token = $request->user()->createToken(
            $request->name, array_values(array_intersect($request->input('permissions', []), ['create', 'delete', 'read', 'update']))
        );

        return back()->with('_flash', [
            'token' => explode('|', $token->plainTextToken, 2)[1],
        ])->with('status', 'api-token-created');
    }

    public function update(Request $request, $tokenId)
    {
        $token = $request->user()->tokens()->where('id', $tokenId)->firstOrFail();

        $token->forceFill([
            'abilities' => array_values(array_intersect($request->input('permissions', []), ['create', 'delete', 'read', 'update'])),
        ])->save();

        return back();
    }

    public function destroy(Request $request, $tokenId)
    {
        $request->user()->tokens()->where('id', $tokenId)->delete();
        return back();
    }
}
