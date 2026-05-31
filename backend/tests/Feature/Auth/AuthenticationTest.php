<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AuthenticationTest extends TestCase
{
    use RefreshDatabase;

    // -------------------------------------------------------------------------
    // Registration
    // -------------------------------------------------------------------------

    public function test_user_can_register(): void
    {
        $payload = [
            'name'                  => 'Test User',
            'email'                 => 'test@example.com',
            'password'              => 'password123',
            'password_confirmation' => 'password123',
        ];

        $response = $this->postJson('/api/auth/register', $payload);

        $response->assertStatus(201)
            ->assertJson([
                'success' => true,
                'message' => 'Registration successful.',
            ])
            ->assertJsonPath('data.user.name', 'Test User')
            ->assertJsonPath('data.user.email', 'test@example.com')
            ->assertJsonStructure(['data' => ['user', 'token']]);

        // User exists in DB
        $this->assertDatabaseHas('users', ['email' => 'test@example.com']);

        // Password is hashed — not stored as plain text
        $storedHash = User::where('email', 'test@example.com')->value('password');
        $this->assertNotEquals('password123', $storedHash);
        $this->assertTrue(Hash::check('password123', $storedHash));
    }

    public function test_register_requires_valid_data(): void
    {
        $response = $this->postJson('/api/auth/register', []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['name', 'email', 'password']);
    }

    // -------------------------------------------------------------------------
    // Login
    // -------------------------------------------------------------------------

    public function test_user_can_login(): void
    {
        User::factory()->create([
            'email'    => 'login@example.com',
            'password' => Hash::make('secret123'),
        ]);

        $response = $this->postJson('/api/auth/login', [
            'email'    => 'login@example.com',
            'password' => 'secret123',
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Login successful.',
            ])
            ->assertJsonPath('data.user.email', 'login@example.com')
            ->assertJsonStructure(['data' => ['user', 'token']]);
    }

    public function test_login_rejects_invalid_credentials(): void
    {
        User::factory()->create([
            'email'    => 'valid@example.com',
            'password' => Hash::make('correct-password'),
        ]);

        $response = $this->postJson('/api/auth/login', [
            'email'    => 'valid@example.com',
            'password' => 'wrong-password',
        ]);

        // LoginUserAction throws ValidationException -> 422
        $response->assertStatus(422)
            ->assertJsonValidationErrors(['email']);
    }

    // -------------------------------------------------------------------------
    // Current user (/me)
    // -------------------------------------------------------------------------

    public function test_unauthenticated_user_cannot_access_me(): void
    {
        $this->getJson('/api/auth/me')
            ->assertStatus(401);
    }

    public function test_authenticated_user_can_access_me(): void
    {
        $user = User::factory()->create();

        Sanctum::actingAs($user);

        $this->getJson('/api/auth/me')
            ->assertStatus(200)
            ->assertJson(['success' => true])
            ->assertJsonPath('data.user.email', $user->email);
    }

    // -------------------------------------------------------------------------
    // Logout
    // -------------------------------------------------------------------------

    public function test_authenticated_user_can_logout(): void
    {
        $user  = User::factory()->create();
        $token = $user->createToken('test-token')->plainTextToken;

        $this->withHeaders(['Authorization' => "Bearer {$token}"])
            ->postJson('/api/auth/logout')
            ->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Logout successful.',
            ]);
    }

    public function test_logout_deletes_the_current_token_from_database(): void
    {
        $user      = User::factory()->create();
        $tokenable = $user->createToken('test-token');
        $token     = $tokenable->plainTextToken;
        $tokenId   = $tokenable->accessToken->id;

        // Confirm token exists before logout
        $this->assertDatabaseHas('personal_access_tokens', ['id' => $tokenId]);

        // Logout with the token
        $this->withHeaders(['Authorization' => "Bearer {$token}"])
            ->postJson('/api/auth/logout')
            ->assertStatus(200);

        // Confirm token was deleted from DB — it can no longer authenticate
        $this->assertDatabaseMissing('personal_access_tokens', ['id' => $tokenId]);
    }
}
