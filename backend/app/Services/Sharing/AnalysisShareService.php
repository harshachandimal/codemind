<?php

namespace App\Services\Sharing;

use App\Models\Analysis;
use App\Models\AnalysisShare;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;

class AnalysisShareService
{
    /**
     * Create a new share link for an analysis, revoking existing active shares.
     *
     * @param Analysis $analysis
     * @param Carbon|null $expiresAt
     * @return array
     */
    public function createShare(Analysis $analysis, ?Carbon $expiresAt = null): array
    {
        // Revoke existing active shares
        $this->revokeShares($analysis);

        // Generate secure raw token
        $token = Str::random(64);

        // Store hash
        $share = $analysis->shares()->create([
            'token_hash' => hash('sha256', $token),
            'expires_at' => $expiresAt,
        ]);

        $frontendUrl = config('app.frontend_url') ?: env('FRONTEND_URL', 'http://127.0.0.1:5173');

        return [
            'token' => $token,
            'share_url' => rtrim($frontendUrl, '/') . '/shared/analyses/' . $token,
            'expires_at' => $share->expires_at,
        ];
    }

    /**
     * Revoke all active shares for an analysis.
     *
     * @param Analysis $analysis
     * @return void
     */
    public function revokeShares(Analysis $analysis): void
    {
        $analysis->shares()
            ->whereNull('revoked_at')
            ->update(['revoked_at' => now()]);
    }

    /**
     * Find a shared analysis by its raw token.
     *
     * @param string $token
     * @return Analysis|null
     */
    public function findSharedAnalysisByToken(string $token): ?Analysis
    {
        $hash = hash('sha256', $token);

        $share = AnalysisShare::where('token_hash', $hash)
            ->whereNull('revoked_at')
            ->where(function ($query) {
                $query->whereNull('expires_at')
                      ->orWhere('expires_at', '>', now());
            })
            ->first();

        if (!$share) {
            return null;
        }

        // Update last accessed time
        $share->update(['last_accessed_at' => now()]);

        return $share->analysis;
    }
}
