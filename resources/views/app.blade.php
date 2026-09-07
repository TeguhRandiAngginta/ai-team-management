<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        <title inertia>{{ config('app.name', 'Laravel') }}</title>

        <!-- Fonts -->
        <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22 fill=%22none%22><path d=%22M50 10L85 30V70L50 90L15 70V30L50 10Z%22 stroke=%22%234F46E5%22 stroke-width=%228%22 stroke-linecap=%22round%22 stroke-linejoin=%22round%22/><path d=%22M50 10V50M85 30L50 50M15 30L50 50M50 90V50%22 stroke=%22%234F46E5%22 stroke-width=%228%22 stroke-linecap=%22round%22 stroke-linejoin=%22round%22/><circle cx=%2250%22 cy=%2250%22 r=%2212%22 fill=%22%234F46E5%22/></svg>">
        <link href="https://fonts.bunny.net/css?family=figtree:400,500,600&display=swap" rel="stylesheet" />

        <!-- Scripts -->
        @routes
        @viteReactRefresh
        @vite(['resources/js/app.jsx', "resources/js/Pages/{$page['component']}.jsx"])
        @inertiaHead
    </head>
    <body class="font-sans antialiased">
        @inertia
    </body>
</html>
