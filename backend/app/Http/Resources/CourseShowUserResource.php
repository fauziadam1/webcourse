<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CourseShowUserResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $user = $request->user();

        return [
            'id' => $this->id,
            'title' => $this->title,
            'description' => $this->description,
            'is_published' => $this->is_published,
            'sets_count' => $this->sets_count ?? 0,
            'students_count' => $this->enrollments_count ?? 0,
            'enrolled' => (bool) $this->enrolled,
        ];
    }
}
