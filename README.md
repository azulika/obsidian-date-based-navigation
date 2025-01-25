# Obsidian Date-Based Navigation

This plugin adds "Previous" and "Next" buttons to your note view in Obsidian, allowing you to navigate to the nearest notes based on dates specified in the frontmatter. You can also filter notes based on required tags.

## Features

*   **Date-Based Navigation:** Adds "Prev" and "Next" buttons to navigate to notes with the nearest dates.
*   **Customizable Date Keys:** Specify which frontmatter keys the plugin should check for dates (e.g., `datetimeCreate`, `created`, `updated`).
*   **Tag Filtering:**  Filter notes based on required tags, so only notes containing specific tags will be considered for navigation.
*   **Open in Current Tab:** Opens the previous or next note in the current tab, replacing the existing content.
*   **Truncated Titles:** Displays truncated note titles (with ellipsis) in the "Prev" and "Next" buttons. You can customize the maximum title length in the settings.

## How to Use

1. **Installation:**
    *   **Manual Installation:**
        1. Download the latest release from the [Releases](<link to your releases page>) section.
        2. Extract the downloaded `.zip` file.
        3. Copy the extracted folder to your Obsidian vault's plugins folder: `<your_vault>/.obsidian/plugins/`.
        4. Reload Obsidian or go to Settings -> Community Plugins and enable "Date-Based Navigation".
    *   **From within Obsidian (once published):**
        1. Open Obsidian and go to **Settings**.
        2. Go to **Community Plugins** and enable it if it's disabled.
        3. Click on **Browse** and search for "Date-Based Navigation".
        4. Click **Install**.
        5. Once installed, click **Enable**.

2. **Configuration:**
    *   Open Obsidian and go to **Settings**.
    *   Go to **Community Plugins** and find "Date-Based Navigation".
    *   **Date Frontmatter Keys:** Enter a comma-separated list of frontmatter keys that contain the dates you want to use for navigation (default: `datetimeCreate`).
    *   **Required Tags:** Enter a comma-separated list of tags. Only notes with at least one of these tags will be considered for navigation.
    *   **Max Title Length:** Set the maximum number of characters to display for note titles in the "Prev" and "Next" buttons (default: 20).

3. **Usage:**
    *   Open a note in your Obsidian vault.
    *   If the note has a valid date in its frontmatter (based on your configured keys) and has at least one of the required tags, you'll see the "Prev" and "Next" buttons at the bottom of the note.
    *   Click the buttons to navigate to the nearest notes based on date and tag filters. The note will open in the current tab.

**Plugin Settings:**

*   Date Frontmatter Keys: `datetimeCreate`
*   Required Tags: `daily, journal`
*   Max Title Length: 15

If you open **Note 1**, you will see:

*   **Prev:** (empty, because no earlier note has both `daily` and `journal` tags)
*   **Next:** `Journal - Oct...` (Note 3 is the next note with a valid date and the required tags)

If you open **Note 2**, you will not see any buttons because it doesn't have both the `daily` and `journal` tags.