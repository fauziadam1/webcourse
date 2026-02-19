<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Lesson extends Model
{
    protected $fillable = [
        'title',
        'description',
        'content',
    ];

    public function setItems()
    {
        return $this->morphMany(SetItem::class, 'item');
    }

    protected static function booted()
    {
        static::deleting(function ($lesson) {
            $lesson->setItems()->delete();
        });
    }
}