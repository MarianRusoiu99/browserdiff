export const HELP_TEXT = {
  main: `
browserdiff - Cross-browser UI testing and visual regression tool

USAGE:
  browserdiff <command> [options]

COMMANDS:
  diff        Compare a URL across multiple browsers
  config      Manage configuration
  baseline    Manage baseline images  
  report      Manage and view reports

OPTIONS:
  -V, --version   Output the version number
  -h, --help      Display help for command

EXAMPLES:
  # Quick test across all browsers
  browserdiff diff https://example.com

  # Test with specific browsers
  browserdiff diff https://example.com --browsers chromium firefox

  # Create baseline for regression testing
  browserdiff baseline create https://example.com

  # View generated report
  browserdiff report view ./browserdiff-output/report-xyz.html

For more information, run:
  browserdiff <command> --help
`,

  diff: `
Compare a URL across multiple browsers and generate visual diff report

USAGE:
  browserdiff diff <url> [options]

ARGUMENTS:
  <url>           URL to test (must be http or https)

OPTIONS:
  -b, --browsers <browsers...>    Browsers to test (chromium, firefox, webkit)
  -w, --width <width>             Viewport width in pixels (default: 1920)
  -h, --height <height>           Viewport height in pixels (default: 1080)
  -t, --threshold <threshold>     Diff threshold 0.0-1.0 (default: 0.1)
  -o, --output <directory>        Output directory (default: ./browserdiff-output)
  -c, --config <path>             Path to config file
  --baseline <browser>            Baseline browser for comparison (default: chromium)
  --ignore-https-errors           Ignore HTTPS certificate errors
  --open                          Open report in browser after generation
  --verbose                       Enable verbose logging

EXAMPLES:
  # Basic usage
  browserdiff diff https://example.com

  # Custom viewport and browsers
  browserdiff diff https://example.com \\
    --browsers chromium firefox webkit \\
    --width 1920 --height 1080

  # Test site with invalid SSL certificate
  browserdiff diff https://example.com --ignore-https-errors

  # Lower threshold for stricter comparison
  browserdiff diff https://example.com --threshold 0.05

  # Use Firefox as baseline
  browserdiff diff https://example.com --baseline firefox --open

EXIT CODES:
  0    Success (no differences or within threshold)
  1    Failure (differences beyond threshold or error)
`,

  config: `
Manage browserdiff configuration

USAGE:
  browserdiff config <command> [options]

COMMANDS:
  init        Initialize a new configuration file
  show        Display current configuration
  validate    Validate configuration file

OPTIONS:
  -p, --path <path>    Path to config file (default: .browserdiff.json)

EXAMPLES:
  # Create new config in current directory
  browserdiff config init

  # Show config from custom path
  browserdiff config show --path ./my-config.json

  # Validate config
  browserdiff config validate

CONFIGURATION:
  The config file (.browserdiff.json) supports:
  
  - browsers: Array of browsers to test
  - viewport: Width, height, and device scale
  - comparison: Threshold and anti-aliasing settings
  - output: Directory and format settings
  - timeout: Page load and screenshot timeouts
  - retry: Retry attempts and delay
  - parallel: Number of concurrent browsers
`,

  baseline: `
Manage baseline images for visual regression testing

USAGE:
  browserdiff baseline <command> [options]

COMMANDS:
  create      Create a new baseline
  list        List all baselines
  update      Update an existing baseline

CREATE OPTIONS:
  <url>                           URL to create baseline for
  -b, --browser <browser>         Browser to use (default: chromium)
  -w, --width <width>             Viewport width (default: 1920)
  -h, --height <height>           Viewport height (default: 1080)
  -c, --config <path>             Config file path
  -d, --dir <directory>           Baseline directory (default: ./baselines)
  --verbose                       Verbose output

LIST OPTIONS:
  -d, --dir <directory>           Baseline directory (default: ./baselines)

UPDATE OPTIONS:
  <id>                            Baseline ID to update
  -d, --dir <directory>           Baseline directory (default: ./baselines)
  -c, --config <path>             Config file path
  --verbose                       Verbose output

EXAMPLES:
  # Create baseline
  browserdiff baseline create https://example.com

  # Create with custom browser and viewport
  browserdiff baseline create https://example.com \\
    --browser firefox \\
    --width 1920 --height 1080

  # List all baselines
  browserdiff baseline list

  # Update specific baseline
  browserdiff baseline update abc-123-def-456

WORKFLOW:
  1. Create baselines for your pages
  2. Run diff tests against baselines
  3. Update baselines when changes are intentional
`,

  report: `
Manage and view browserdiff reports

USAGE:
  browserdiff report <command> [options]

COMMANDS:
  view        Open a report in the browser
  list        List all available reports

VIEW OPTIONS:
  <path>      Path to the report HTML file

LIST OPTIONS:
  -o, --output <directory>        Output directory (default: ./browserdiff-output)
  -c, --config <path>             Config file path

EXAMPLES:
  # View specific report
  browserdiff report view ./browserdiff-output/report-abc123.html

  # List all reports
  browserdiff report list

  # List reports in custom directory
  browserdiff report list --output ./custom-output

REPORT CONTENTS:
  - Session metadata (URL, browsers, viewport)
  - Overall status (identical, within-threshold, different)
  - Browser comparison metrics
  - Diff percentages and pixel counts
  - Page load times
  - Error messages (if any)
`,
};

export function printHelp(topic: keyof typeof HELP_TEXT = 'main'): void {
  // eslint-disable-next-line no-console
  console.log(HELP_TEXT[topic]);
}
