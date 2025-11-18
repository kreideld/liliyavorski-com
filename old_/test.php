<?php
function embedSite($url, $apiBaseReplace = [
    'from' => 'https://lili.local',
    'to' => 'https://waylight.me'
]) {
    // Parse the base URL to help with resolving relative paths
    $parsedUrl = parse_url($url);
    $baseUrl = $parsedUrl['scheme'] . '://' . $parsedUrl['host'];

    // Initialize cURL
    $ch = curl_init();

    // Set cURL options
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);

    // Execute request
    $html = curl_exec($ch);

    // Create DOM parser
    $dom = new DOMDocument();
    @$dom->loadHTML($html);

    // Modify links, styles, and scripts
    $elements = [
        'a' => 'href',
        'link' => 'href',
        'script' => 'src',
        'img' => 'src'
    ];
    die();

    foreach ($elements as $tag => $attribute) {
        $items = $dom->getElementsByTagName($tag);
        foreach ($items as $item) {
            $value = $item->getAttribute($attribute);

            // Skip absolute URLs
            if (parse_url($value, PHP_URL_SCHEME)) {
                // Rewrite API URLs if they match the specified base
                if (strpos($value, $apiBaseReplace['from']) === 0) {
                    print_r($value);

                    $value = str_replace(
                        $apiBaseReplace['from'],
                        $apiBaseReplace['to'],
                        $value
                    );
                } else {
                    continue;
                }
            }

            // Resolve relative URLs
            if (strpos($value, '/') === 0) {
                // Absolute path from root
                $resolvedUrl = $baseUrl . $value;
            } else {
                // Relative path
                $resolvedUrl = rtrim($baseUrl, '/') . '/' . $value;
            }

            $item->setAttribute($attribute, $resolvedUrl);
        }
    }

    // Output modified HTML
    echo $dom->saveHTML();

    // Close cURL
    curl_close($ch);
}

// Example usage with custom API base URL replacement
embedSite(
    'https://waylight.me/lili-yavorski/product/09493-7c430?promo=devtest',
    [
        'from' => 'https://lili.local',
        'to' => 'https://waylight.me'
    ]
);

// https://lili.local/test.php
?>