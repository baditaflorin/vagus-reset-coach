import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const version = JSON.parse(
  readFileSync(resolve(process.cwd(), "package.json"), "utf8"),
) as {
  version: string;
};
const fixturePath = resolve(
  process.cwd(),
  "test/fixtures/app-state/phase3-state.json",
);

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
  await expect(
    page.getByText(new RegExp(`Version ${version.version}`)),
  ).toBeVisible();
  await expect(page.getByText(/Commit [a-z0-9]+/)).toBeVisible();
  await expect(page.getByRole("button", { name: /Start/ })).toBeEnabled();
  await page.setInputFiles('input[type="file"]', fixturePath);
  await expect(
    page.getByText(/Imported 1 session record from phase3-state\.json\./),
  ).toBeVisible();
  await expect(
    page.getByRole("complementary").getByText(/5\.4 breaths\/min/),
  ).toBeVisible();
  await expect(page.getByText(/RMSSD 38 ms/).first()).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole("complementary").getByText(/5\.4 breaths\/min/),
  ).toBeVisible();
  await expect(page.getByText(/RMSSD 38 ms/).first()).toBeVisible();
  expect(consoleErrors).toEqual([]);
});
