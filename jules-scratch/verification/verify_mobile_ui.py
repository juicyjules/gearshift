from playwright.sync_api import sync_playwright, expect

def run_verification():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            viewport={'width': 375, 'height': 812},
            is_mobile=True,
            user_agent='Mozilla/5.0 (iPhone; CPU iPhone OS 13_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.1.1 Mobile/15E148 Safari/604.1'
        )
        page = context.new_page()

        try:
            # Navigate to the app
            page.goto("http://localhost:5173", timeout=30000)
            page.wait_for_timeout(2000) # wait for initial render

            # It might show a connection modal first, let's handle that.
            try:
                page.wait_for_selector('input[name="rpc-url"]', timeout=5000)
                print("Connection modal found. Filling form.")
                page.fill('input[name="rpc-url"]', 'http://localhost:9091/transmission/rpc')
                page.click('button:text("Connect")')
            except Exception:
                # If the modal is not there, we are already connected.
                print("Connection modal not found, assuming already connected.")
                pass

            # Take a screenshot to see what's on the page before we look for the list
            page.screenshot(path="jules-scratch/verification/pre-list-check.png")
            print("Took pre-list-check screenshot.")

            # Wait for the main content to load
            # Let's wait for either the torrent list or some "no torrents" message
            main_content = page.locator(".torrent-list, .empty-state")
            expect(main_content).to_be_visible(timeout=15000)

            # Give it a moment for animations and rendering
            page.wait_for_timeout(1000)

            # Take screenshot of the main view
            page.screenshot(path="jules-scratch/verification/main_view.png")
            print("Took main view screenshot.")

            # Find and click the mobile menu toggle button
            menu_toggle = page.locator('.mobile-menu-toggle')
            expect(menu_toggle).to_be_visible()
            menu_toggle.click()

            # Wait for the mobile menu to be visible
            expect(page.locator('.mobile-menu')).to_be_visible()
            page.wait_for_timeout(500) # wait for animation

            # Take screenshot of the open menu
            page.screenshot(path="jules-scratch/verification/mobile_menu_view.png")
            print("Took mobile menu view screenshot.")

        except Exception as e:
            print(f"An error occurred: {e}")
            page.screenshot(path="jules-scratch/verification/error.png")
            print("Took error screenshot.")

        finally:
            browser.close()

if __name__ == "__main__":
    run_verification()
