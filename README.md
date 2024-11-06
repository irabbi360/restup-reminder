# RestUp Reminder - Break Timer App

![](https://img.shields.io/github/downloads/irabbi360/restup-reminder/total?logo=github&style=social)

RestUp Reminder is a desktop application designed to help manage and enforce regular breaks. It’s available across Windows, macOS, and Linux platforms.

RestUp Reminder offers customizable features to suit your break preferences:

- Set your preferred break duration and frequency.
- Choose between a simple notification or a fullscreen break reminder.
- Personalize the messages displayed during breaks, shown randomly.
- Adjust app settings to customize break intervals, notification type (popup or fullscreen), and even popup window color.
- Enable smart break tracking that resets the countdown if it detects inactivity.

Please note: RestUp Reminder is provided "as-is" and is intended for personal use. We do not offer support for enterprise environments or commercial deployments, and no warranties or support guarantees are included.

## Installation

## Installation

- **Windows** -  (unsigned - you may receive a warning on install, press more info -> run anyway)
- **macOS** - 
- **Linux**:
    - Auto-updating **[preferred]**:
        -  - **also available in the Ubuntu App Store**.
        - 

## Screenshots

## ![break panel](screenshots/break.png)

## ![settings panel](screenshots/settings.png)

![notification](screenshots/notification.png)

## FAQ

### Why can't I see the app in the tray?

Some operating systems, such as Linux distributions running plain Gnome (e.g. Fedora) or Pantheon (e.g. Elementary OS), don't support system tray icons. In this case, simply re-run the app to open the settings window. You will lose access to certain functionality only available in the tray menu, but at least this workaround lets you use the app.

### How can I hard reset the app's data

In case a bug has left the UI in an unrecoverable state, you can reset the app data by exiting the app, deleting the below folder, and starting the app again.

Linux: `/home/<USERNAME>/.config/RestUp Reminder`

macOS: `/Users/<USERNAME>/Library/Logs/RestUp Reminder`

Windows: `C:\Users\<USERNAME>\AppData\Roaming\RestUp Reminder`

## Development

See [./DEVELOPMENT.md](DEVELOPMENT.md).

## Contributing

We welcome contributions from the community! If you're interested in getting involved, feel free to reach out or open a pull request (PR) with your contributions. Please ensure your code aligns with our project's guidelines, and don't hesitate to suggest improvements or new features.

Thank you for helping make this project better for everyone!