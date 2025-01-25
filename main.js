const {
  Plugin,
  moment,
  Setting,
  MarkdownView,
  PluginSettingTab,
} = require("obsidian");

const DEFAULT_SETTINGS = {
  dateKeys: ["datetimeCreate"],
  requiredTags: [],
  maxTitleLength: 10, // Maximum characters for note titles in buttons
};

module.exports = class DateBasedNavigationPlugin extends Plugin {
  async onload() {
    await this.loadSettings();

    this.addSettingTab(new DateBasedNavigationSettingTab(this.app, this));

    this.registerEvent(
      this.app.workspace.on("file-open", this.addNavigationButtons.bind(this))
    );
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }

  addNavigationButtons(file) {
    if (!file) return;

    const view = this.app.workspace.getActiveViewOfType(MarkdownView);
    if (!view) return;

    const editor = view.editor;
    if (!editor) return;

    this.removeNavigationButtons();

    const filesWithDatesAndTags = this.getFilesWithDatesAndTags();

    const currentFileDate = this.getDateFromFrontmatter(file);
    if (!currentFileDate) return;

    const sortedFiles = filesWithDatesAndTags
      .filter((f) => f.date)
      .sort((a, b) => a.date.valueOf() - b.date.valueOf());

    const currentIndex = sortedFiles.findIndex(
      (f) => f.file.path === file.path
    );

    // Filter for next and previous notes with required tags
    let prevFile = null;
    for (let i = currentIndex - 1; i >= 0; i--) {
      const tags = Array.isArray(sortedFiles[i].tags)
        ? sortedFiles[i].tags
        : [sortedFiles[i].tags];

      // Include all if requiredTags is empty
      if (
        this.settings.requiredTags[0] === "" || // Check if requiredTags is empty
        tags.some((tag) => this.settings.requiredTags.includes(tag))
      ) {
        prevFile = sortedFiles[i].file;
        break;
      }
    }


    let nextFile = null;
    for (let i = currentIndex + 1; i < sortedFiles.length; i++) {
      const tags = Array.isArray(sortedFiles[i].tags)
        ? sortedFiles[i].tags
        : [sortedFiles[i].tags];

   // Include all if requiredTags is empty
      if (
        this.settings.requiredTags[0] === "" || // Check if requiredTags is empty
        tags.some((tag) => this.settings.requiredTags.includes(tag))
      ) {
        nextFile = sortedFiles[i].file;
        break;
      }
    }

    const buttonContainer = document.createElement("div");
    buttonContainer.classList.add("date-nav-button-container");

    if (prevFile) {
      const prevButton = document.createElement("button");
      prevButton.textContent = this.truncateTitle(prevFile.basename);
      prevButton.textContent = "< " + prevButton.textContent;
      prevButton.classList.add("date-nav-button");
      // Open in current tab
      prevButton.onclick = () => {
        const activeLeaf = this.app.workspace.getLeaf(); // Get current leaf
        activeLeaf.openFile(prevFile); // Open the file in the current leaf
      };
      buttonContainer.appendChild(prevButton);
    }

    if (nextFile) {
      const nextButton = document.createElement("button");
      nextButton.textContent = this.truncateTitle(nextFile.basename);
      nextButton.textContent = nextButton.textContent + " >";
      nextButton.classList.add("date-nav-button");
      // Open in current tab
      nextButton.onclick = () => {
        const activeLeaf = this.app.workspace.getLeaf(); // Get current leaf
        activeLeaf.openFile(nextFile); // Open the file in the current leaf
      };
      buttonContainer.appendChild(nextButton);
    }

    const editorContent = editor.containerEl;
    editorContent.appendChild(buttonContainer);
  }

  removeNavigationButtons() {
    const existingButtons = document.querySelectorAll(
      ".date-nav-button-container"
    );
    existingButtons.forEach((container) => container.remove());
  }

  // Modified to also get tags
  getFilesWithDatesAndTags() {
    const files = this.app.vault.getMarkdownFiles();
    const filesWithDatesAndTags = files.map((file) => ({
      file,
      date: this.getDateFromFrontmatter(file),
      tags: this.getTags(file), // Get tags from the file
    }));
    return filesWithDatesAndTags;
  }

  getDateFromFrontmatter(file) {
    const meta = this.app.metadataCache.getFileCache(file);
    if (!meta || !meta.frontmatter) return null;

    for (const key of this.settings.dateKeys) {
      if (meta.frontmatter[key]) {
        const date = moment(meta.frontmatter[key]);
        if (date.isValid()) {
          return date;
        }
      }
    }

    return null;
  }

  // Get tags from a file (handling single tag or multiple tags)
  getTags(file) {
    const meta = this.app.metadataCache.getFileCache(file);
    if (!meta || !meta.frontmatter || !meta.frontmatter.tags) return [];

    // Ensure tags is always an array
    if (Array.isArray(meta.frontmatter.tags)) {
      return meta.frontmatter.tags;
    } else {
      // If it's a string, convert it to an array
      return [meta.frontmatter.tags];
    }
  }

  // Truncate title with ellipsis
  truncateTitle(title) {
    const maxLength = this.settings.maxTitleLength;
    if (title.length <= maxLength) {
      return title;
    } else {
      return title.substring(0, maxLength - 3) + "...";
    }
  }
};

class DateBasedNavigationSettingTab extends PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display() {
    const { containerEl } = this;
    containerEl.empty();

    new Setting(containerEl)
      .setName("Date Frontmatter Keys")
      .setDesc(
        "Comma-separated list of frontmatter keys to check for dates (e.g., datetimeCreate, createdDate)"
      )
      .addText((text) =>
        text
          .setPlaceholder("Enter keys separated by commas")
          .setValue(this.plugin.settings.dateKeys.join(","))
          .onChange(async (value) => {
            this.plugin.settings.dateKeys = value
              .split(",")
              .map((key) => key.trim());
            await this.plugin.saveSettings();
          })
      );

    // Setting for required tags
    new Setting(containerEl)
      .setName("Required Tags")
      .setDesc("Comma-separated list of tags that notes must have to be considered for navigation")
      .addText(text => text
        .setPlaceholder("Enter tags separated by commas")
        .setValue(this.plugin.settings.requiredTags.join(","))
        .onChange(async (value) => {
          this.plugin.settings.requiredTags = value.split(",").map(tag => tag.trim());
          await this.plugin.saveSettings();
        })
      );

    // Setting for max title length in buttons
    new Setting(containerEl)
      .setName("Max Title Length")
      .setDesc("Maximum number of characters to display for note titles in the Prev/Next buttons")
      .addText(text => text
        .setPlaceholder("Enter max length")
        .setValue(String(this.plugin.settings.maxTitleLength))
        .onChange(async (value) => {
          this.plugin.settings.maxTitleLength = parseInt(value, 10);
          await this.plugin.saveSettings();
        })
      );
  }
}