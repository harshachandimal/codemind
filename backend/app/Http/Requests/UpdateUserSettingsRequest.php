<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdateUserSettingsRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'default_language' => ['sometimes', 'string', 'in:javascript,python'],
            'editor_font_size' => ['sometimes', 'integer', 'min:12', 'max:22'],
            'show_visual_explanations' => ['sometimes', 'boolean'],
            'show_runtime_trace' => ['sometimes', 'boolean'],
            'dashboard_density' => ['sometimes', 'string', 'in:comfortable,compact'],
        ];
    }
}
