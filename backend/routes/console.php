<?php

use Illuminate\Support\Facades\Artisan;

Artisan::command('gaspronal:status', function (): void {
    $this->info('Gaspronal backend OK');
})->purpose('Verifica que el backend puede iniciar.');
