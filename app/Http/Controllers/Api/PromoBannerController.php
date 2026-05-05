<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use App\Models\PromoBanner;
use Illuminate\Support\Facades\Storage;

class PromoBannerController extends Controller
{
    public function index()
    {
        return response()->json(PromoBanner::latest()->get());
    }

    public function active()
    {
        return response()->json(PromoBanner::where('is_active', true)->latest()->get());
    }

    public function store(Request $request)
    {
        $request->validate([
            'title' => 'nullable|string|max:255',
            'image' => 'required|image|max:5120',
        ]);

        $path = $request->file('image')->store('banners', 'public');

        $banner = PromoBanner::create([
            'title' => $request->title,
            'image_path' => '/storage/' . $path,
            'is_active' => true,
        ]);

        return response()->json($banner, 201);
    }

    public function toggle(PromoBanner $banner)
    {
        $banner->update(['is_active' => !$banner->is_active]);
        return response()->json(['message' => 'Status updated']);
    }

    public function destroy(PromoBanner $banner)
    {
        $relativePath = str_replace('/storage/', '', $banner->image_path);
        if (Storage::disk('public')->exists($relativePath)) {
            Storage::disk('public')->delete($relativePath);
        }
        $banner->delete();
        return response()->json(['message' => 'Banner deleted']);
    }
}
