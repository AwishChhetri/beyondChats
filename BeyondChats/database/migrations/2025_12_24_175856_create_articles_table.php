    <?php

    use Illuminate\Database\Migrations\Migration;
    use Illuminate\Database\Schema\Blueprint;
    use Illuminate\Support\Facades\Schema;

    return new class extends Migration
    {
        public function up(): void
        {
            Schema::create('articles', function (Blueprint $table) {
                $table->id();
                $table->string('title');
                $table->string('slug');
                $table->longText('content');
                $table->longText('updated_content')->nullable(); 
                $table->string('source_url');
                $table->boolean('is_generated')->default(false);
                $table->timestamps();
            });
        }

        public function down(): void
        {
            Schema::dropIfExists('articles');
        }
    };
