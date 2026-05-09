# State Taxonomy

| State                    | Meaning                                               | User Exit                                            |
| ------------------------ | ----------------------------------------------------- | ---------------------------------------------------- |
| idle                     | No camera or session active                           | Start camera, start breath-only reset                |
| camera-requesting        | Browser permission prompt is active                   | Grant or deny permission                             |
| camera-ready             | Camera is available, signal may still warm up         | Start reset, stop camera by leaving page             |
| camera-denied            | Camera unavailable or denied                          | Retry camera, continue breath-only                   |
| measuring-warmup         | Frames are arriving but pulse confidence is not ready | Wait, continue breath-only, stop                     |
| measuring-ready          | Signal is usable                                      | Continue, stop                                       |
| measuring-low-confidence | Signal is weak or noisy                               | Follow the suggested fix, continue breath-only, stop |
| breath-only              | Pacer is running without usable rPPG                  | Continue or stop                                     |
| saving                   | Session summary is being persisted                    | Wait; retry on recoverable error                     |
| saved                    | Local record persisted                                | Start another, export, clear history                 |
| recoverable-error        | Work is intact but action failed                      | Retry, export history, clear invalid data            |
| fatal-error              | Browser cannot support the required flow              | Use another browser/device                           |

No state may trap the user without a visible next action.
