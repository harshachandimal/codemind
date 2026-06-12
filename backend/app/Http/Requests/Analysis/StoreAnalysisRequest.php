<?php

namespace App\Http\Requests\Analysis;

use Illuminate\Foundation\Http\FormRequest;

class StoreAnalysisRequest extends FormRequest
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
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'title' => ['nullable', 'string', 'max:255'],
            'language' => ['required', 'string', 'in:javascript'],
            'source_code' => ['required', 'string', 'max:20000'],
            'entryFunction' => ['nullable', 'string', 'max:255'],
            'input' => ['nullable', 'array'],
        ];
    }
}
