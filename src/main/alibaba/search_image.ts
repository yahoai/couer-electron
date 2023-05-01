import webdriver from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome';

console.log(chrome);

export async function startSearch(arg = null) {
  try {
    console.log(arg);
    const service = new chrome.ServiceBuilder(
      '~/Desktop/work/personal/couer/alibaba-electron/chromedriver/'
    ).build();
    // chrome.setDefaultService(service);

    const driver = await new webdriver.Builder().forBrowser('chrome').build();

    await driver.get('https://www.alibaba.com/');

    const imageSearchBtnXpath = `//*[@id="J_SC_header"]/header/div[3]/div/div/div[2]/div/div[1]/div/div[1]`;

    await driver.findElement(webdriver.By.xpath(imageSearchBtnXpath)).click();

    const fileUploadXpath = `//*[@id="image-upload-root"]/div/div/div[1]/div[2]/div/div/span`;

    const fileInput = `//*[@id="image-upload-file"]`;

    // await driver.findElement(webdriver.By.xpath(fileUploadXpath)).click();
    await driver
      .findElement(webdriver.By.xpath(fileInput))
      .sendKeys(arg?.file?.path);
  } catch (e) {
    console.log(e);
  }
}
