<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use App\Models\Article;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;

class ArticleController extends Controller
{
    public function index()
    {
        return response()->json(Article::with('author:id,name')->latest()->get());
    }

    public function published()
    {
        return response()->json(Article::with('author:id,name')->where('is_published', true)->latest()->get());
    }

    public function show($slug)
    {
        $article = Article::with('author:id,name')->where('slug', $slug)->firstOrFail();
        return response()->json($article);
    }

    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'image' => 'nullable|image|max:5120',
        ]);

        $path = null;
        if ($request->hasFile('image')) {
            $path = '/storage/' . $request->file('image')->store('articles', 'public');
        }

        $article = Article::create([
            'title' => $request->title,
            'slug' => Str::slug($request->title) . '-' . time(),
            'content' => $request->content,
            'image_path' => $path,
            'author_id' => $request->user()->id,
            'is_published' => true,
        ]);

        return response()->json($article, 201);
    }

    public function destroy(Article $article)
    {
        if ($article->image_path) {
            $relativePath = str_replace('/storage/', '', $article->image_path);
            if (Storage::disk('public')->exists($relativePath)) {
                Storage::disk('public')->delete($relativePath);
            }
        }
        $article->delete();
        return response()->json(['message' => 'Article deleted']);
    }
}
