import { Chrome, Download } from "lucide-react";

export function ExtensionLink() {
    const extensionUrl = "https://chromewebstore.google.com/detail/optionyar-%D8%A2%D9%BE%D8%B4%D9%86%E2%80%8C%DB%8C%D8%A7%D8%B1/mnpfikomilcgieconkiiodfcpkjaclcb";

    return (
        <a
            href={extensionUrl}
            target="_blank"
            rel="noreferrer"
            className="hidden md:flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl transition-colors border
      
      /* Light Mode: Purple theme */
      text-purple-700 bg-purple-50 border-purple-200 
      hover:bg-purple-100 hover:text-purple-800
      
      /* Dark Mode: Translucent purple */
      dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-800
      dark:hover:bg-purple-900/40"
        >
            <Chrome className="w-4 h-4" />
            <span className="hidden lg:inline"> افزونه کروم</span>
            {/* Optional: Small download icon for extra context */}
            <Download className="w-3 h-3 hidden sm:inline opacity-50" />
        </a>
    );
}
