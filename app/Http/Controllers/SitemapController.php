<?php

namespace App\Http\Controllers;

use Illuminate\Http\Response;

class SitemapController extends Controller
{
    public function __invoke(): Response
    {
        $pages = [
            ['loc' => '/', 'changefreq' => 'weekly', 'priority' => '1.0'],
            ['loc' => '/privacy-policy', 'changefreq' => 'monthly', 'priority' => '0.8'],
            ['loc' => '/terms-of-service', 'changefreq' => 'monthly', 'priority' => '0.8'],
            ['loc' => '/login', 'changefreq' => 'monthly', 'priority' => '0.5'],
            ['loc' => '/register', 'changefreq' => 'monthly', 'priority' => '0.6'],
        ];

        $appUrl = rtrim((string) config('app.url'), '/');
        $now = now()->toIso8601String();

        $xml = '<?xml version="1.0" encoding="UTF-8"?>'."\n";
        $xml .= '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'."\n";

        foreach ($pages as $page) {
            $xml .= '  <url>'."\n";
            $xml .= '    <loc>'.$appUrl.$page['loc'].'</loc>'."\n";
            $xml .= '    <lastmod>'.$now.'</lastmod>'."\n";
            $xml .= '    <changefreq>'.$page['changefreq'].'</changefreq>'."\n";
            $xml .= '    <priority>'.$page['priority'].'</priority>'."\n";
            $xml .= '  </url>'."\n";
        }

        $xml .= '</urlset>';

        return response($xml, 200, ['Content-Type' => 'text/xml']);
    }
}
