<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SetItem extends Model
{
    protected $fillable = [
        'set_id',
        'lesson_id',
        'quiz_id',
        'sort_order',
    ];

    public function lesson()
    {
        return $this->belongsTo(Lesson::class);
    }

    public function quiz()
    {
        return $this->belongsTo(Quiz::class);
    }

    public function set()
    {
        return $this->belongsTo(Set::class);
    }
}
