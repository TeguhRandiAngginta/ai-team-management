<?php

namespace App\Notifications;

use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Notifications\Messages\MailMessage;

class CustomResetPassword extends ResetPassword
{
    protected function buildMailMessage($url)
    {
        return (new MailMessage)
            ->subject('Permintaan Reset Kata Sandi - AI Team Management')
            ->greeting('Halo Kak!')
            ->line('Anda menerima email ini karena sistem kami menerima permintaan pengaturan ulang kata sandi untuk akun Anda.')
            ->action('Reset Kata Sandi', $url)
            ->line('Tautan reset kata sandi ini hanya berlaku selama ' . config('auth.passwords.'.config('auth.defaults.passwords').'.expire') . ' menit ke depan.')
            ->line('Jika Anda merasa tidak pernah meminta reset kata sandi, abaikan saja email ini dan akun Anda akan tetap aman.')
            ->salutation('Salam hangat, Tim AI Team Management');
    }
}