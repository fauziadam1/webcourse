<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Quiz extends Model
{
    protected $fillable = ['title', 'description', 'passing_score'];

    public function sets()
    {
        return $this->morphToMany(Set::class, 'item', 'set_items')
            ->withPivot('sort_order')
            ->withTimestamps();
    }

    public function questions()
    {
        return $this->hasMany(Question::class);
    }

    public function completions()
    {
        return $this->morphMany(Completion::class, 'item');
    }

    public function results()
    {
        return $this->hasMany(Result::class);
    }
}
