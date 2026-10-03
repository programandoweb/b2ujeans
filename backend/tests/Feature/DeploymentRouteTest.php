<?php

namespace Tests\Feature;

use Tests\TestCase;

class DeploymentRouteTest extends TestCase
{
    public function test_deployment_endpoint_is_exposed_outside_auth_prefix_and_requires_authentication(): void
    {
        $this->getJson('/api/v1/deployments')
            ->assertUnauthorized();

        $this->getJson('/api/v1/auth/deployments')
            ->assertNotFound();
    }
}
