import { expect, test } from "@playwright/test";

test("loads the public Pages build and exposes project metadata", async ({
  page,
}) => {
  const consoleErrors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") {
      consoleErrors.push(message.text());
    }
  });

  await page.goto("/vagus-reset-coach/");
  await expect(
    page.getByRole("heading", { name: "Vagus Reset Coach" }),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: /GitHub/ })).toHaveAttribute(
    "href",
    "https://github.com/baditaflorin/vagus-reset-coach",
  );
  await expect(page.getByRole("link", { name: /PayPal/ })).toHaveAttribute(
    "href",
    "https://www.paypal.com/paypalme/florinbadita",
  );
  await expect(page.getByText(/Version 0\.2\.0/)).toBeVisible();
  await expect(page.getByText(/Commit [a-z0-9]+/)).toBeVisible();
  await expect(page.getByRole("button", { name: /Start/ })).toBeEnabled();
  expect(consoleErrors).toEqual([]);
});
