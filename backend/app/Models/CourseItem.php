<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CourseItem extends Model
{
    use HasFactory;

    protected $table = 'course_items';

    protected $fillable = [
        'course_id',
        'item_type',
        'item_id',
        'sort_order'
    ];

    public function course()
    {
        return $this->belongsTo(Course::class);
    }

    public function lesson()
    {
        return $this->belongsTo(Lesson::class, 'item_id')
            ->where('item_type', 'lesson');
    }

    public function quiz()
    {
        return $this->belongsTo(Quiz::class, 'item_id')
            ->where('item_type', 'quiz');
    }

    public function item()
    {
        return $this->morphTo(null, 'item_type', 'item_id');
    }
}
