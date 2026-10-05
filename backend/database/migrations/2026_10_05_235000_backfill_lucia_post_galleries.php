<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Storage;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('content_creator_runs')
            ->whereNotNull('post_id')
            ->orderBy('id')
            ->get()
            ->each(function (object $run): void {
                $post = DB::table('posts')->where('id', $run->post_id)->first();
                if (!$post) {
                    return;
                }

                $currentGallery = json_decode((string) ($post->gallery ?? '[]'), true);
                if (is_array($currentGallery) && count($currentGallery) > 1) {
                    return;
                }

                $payload = json_decode((string) ($run->final_payload ?? '{}'), true);
                $imagePaths = is_array($payload) ? ($payload['image_paths'] ?? []) : [];
                if (!is_array($imagePaths) || count($imagePaths) === 0) {
                    return;
                }

                $gallery = [];

                foreach (array_values($imagePaths) as $index => $sourcePath) {
                    if (!is_string($sourcePath) || trim($sourcePath) === '') {
                        continue;
                    }

                    $absolute = public_path(ltrim($sourcePath, '/'));
                    if (!File::exists($absolute)) {
                        continue;
                    }

                    $ext = strtolower(pathinfo($absolute, PATHINFO_EXTENSION) ?: 'png');
                    $filename = 'lucia-'.($index + 1).'.'.$ext;
                    Storage::disk('public')->put(
                        "posts/{$post->id}/{$filename}",
                        File::get($absolute)
                    );
                    $gallery[] = "/api/post-media/{$post->id}/{$filename}";
                }

                if (count($gallery) === 0) {
                    return;
                }

                DB::table('posts')
                    ->where('id', $post->id)
                    ->update([
                        'gallery' => json_encode($gallery, JSON_UNESCAPED_SLASHES),
                        'featured_image' => $gallery[0],
                        'og_image' => $gallery[0],
                        'updated_at' => now(),
                    ]);
            });
    }

    public function down(): void
    {
        // No se borran archivos ni referencias para evitar pérdida de medios editoriales.
    }
};
