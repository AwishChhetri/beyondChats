<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Article;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Log;

class ArticleController extends Controller
{
    // GET /api/articles
    public function index()
    {
        return response()->json(Article::latest()->get(), 200);
    }

    // GET /api/articles/{id}
    public function show($id)
    {
        return response()->json(Article::findOrFail($id), 200);
    }

    // POST /api/articles
    public function store(Request $request)
    {
        $data = $request->all();

        $data['title'] = mb_convert_encoding($data['title'], 'UTF-8', 'UTF-8');
        $data['content'] = mb_convert_encoding($data['content'], 'UTF-8', 'UTF-8');
        $data['source_url'] = mb_convert_encoding($data['source_url'], 'UTF-8', 'UTF-8');

        $request->merge($data);

        $validated = $request->validate([
            'title' => 'required|string',
            'content' => 'required|string',
            'source_url' => 'required|string',
        ]);

        $article = Article::create([
            'title' => $validated['title'],
            'slug' => Str::slug($validated['title']) . '-' . uniqid(),
            'content' => $validated['content'],
            'source_url' => $validated['source_url'],
            'is_generated' => false,
        ]);

        return response()->json($article, 201);
    }


    // PUT /api/articles/{id}
    public function update(Request $request, $id)
    {

        $article = Article::findOrFail($id);

        $article->update([
            'title' => $request->title ?? $article->title,
            'content' => $request->content ?? $article->content,
            'updated_content' => $request->updated_content ?? $article->updated_content,
            'is_generated' => $request->is_generated ?? $article->is_generated,
        ]);

        return response()->json($article, 200);
    }


    // DELETE /api/articles/{id}
    public function destroy($id)
    {

        Article::destroy($id);

        return response()->json(['deleted' => true], 200);
    }

    // GET /api/articles/latest
    public function latest()
    {

        $article = Article::where('is_generated', false)
            ->orderBy('created_at', 'desc')
            ->first();

        return response()->json($article, 200);
    }
}
