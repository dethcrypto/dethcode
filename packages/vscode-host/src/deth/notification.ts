/**
 * @file welcome notification
 * Based on https://github1s.com/conwnet/github1s/blob/HEAD/vscode-web-github1s/src/vs/github1s/notification.ts
 */

import "vs/css!./notification";

const NOTIFICATION_STORAGE_KEY = "dethcrypto:ethereum-code-viewer.notification";
// Change this if a new notification should be shown
const NOTIFICATION_STORAGE_VALUE = "1";

const notifications = [
  {
    text: "💸 Enjoy using Ethereum Code Viewer? Consider funding development via GitCoin 💸",
    link: "https://gitcoin.co/grants/4038/typechain-dksth",
  },
];

const notificationHtml = `${notifications.map(
  (notification) => `
		<div class="notification-main">
			<a href="${notification.link}" target="_blank" class="notification-content">
				${notification.text}
			</a>
		</div>`
)}
<div class="notification-footer">
	<button class="notification-confirm-button">Whatever</button>
</div>
`;

export const renderNotification = () => {
  // If user has confirmed the notification and checked `don't show me again`, ignore it
  if (
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    !window.localStorage ||
    window.localStorage.getItem(NOTIFICATION_STORAGE_KEY) ===
      NOTIFICATION_STORAGE_VALUE
  ) {
    return;
  }

  const notificationElement = document.createElement("div");
  notificationElement.classList.add("deth-notification");
  notificationElement.innerHTML = notificationHtml;
  document.body.appendChild(notificationElement);

  notificationElement.querySelector<HTMLButtonElement>(
    ".notification-confirm-button"
  )!.onclick = () => {
    // We won't show the banner again until NOTIFICATION_STORAGE_VALUE is changed.
    window.localStorage.setItem(
      NOTIFICATION_STORAGE_KEY,
      NOTIFICATION_STORAGE_VALUE
    );
    document.body.removeChild(notificationElement);
  };
};
