// https://catalog.utdallas.edu/2021/undergraduate/programs
// https://catalog.utdallas.edu/2021/undergraduate/minors
import { FirefoxScraper } from "./CoursebookScraper";
import { By, WebElement, NoSuchElementError } from 'selenium-webdriver';
import schemas from '../api/schemas';
import firefox from 'selenium-webdriver/firefox';

class DegreesScraper extends FirefoxScraper {
    private PROGRAMS_URL = 'https://catalog.utdallas.edu/2021/undergraduate/programs';
    private MINORS_URL = 'https://catalog.utdallas.edu/2021/undergraduate/minors';

    private degrees: Array<schemas.Degree> = [];

    private async scrapeDegreeLinks(): Promise<Array<string>> {
        const DEGREE_LINKS_XPATH = "//div[@id='bukku-page']//a[contains(@href, '/undergraduate/programs/')]";

        const links: Array<string> = [];

        await this.Driver.get(this.PROGRAMS_URL);

        let linkElements: Array<WebElement> = await this.Driver.findElements(By.xpath(DEGREE_LINKS_XPATH));
        for (const element of linkElements) {
            links.push(await element.getAttribute('href'));
        }

        await this.Driver.get(this.MINORS_URL);
        
        linkElements = await this.Driver.findElements(By.xpath(DEGREE_LINKS_XPATH));
        for (const element of linkElements) {
            let href: string = await element.getAttribute('href');
            if (href === 'http://catalog.utdallas.edu/2021/undergraduate/programs/is/interdisciplinary-studiesa') { // Catalog contains a mistake in the url for this one
                href = href.substring(0, href.length - 1);
            }
            links.push(href);
        }

        return links;
    }
    
    async Scrape() : Promise<void> {
        const degreeLinks = await this.scrapeDegreeLinks();
        
        for (const link of degreeLinks) {
            await this.Driver.get(link);
            console.log(link);
        }
    }

    Clear() : void {
        this.degrees = [];
    }
}

const options = new firefox.Options();
const service = new firefox.ServiceBuilder(process.env.SELENIUM_DRIVER);
const degrees_scraper = new DegreesScraper(options, service);

degrees_scraper.Scrape().then(() => {
    degrees_scraper.Kill();
});