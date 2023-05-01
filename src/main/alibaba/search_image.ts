import { ipcMain } from 'electron';
import webdriver, { until } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome';

const options = new chrome.Options();
options.addArguments('-start-debugger-server', '9222');
options.addArguments('--headless');

// const service = new chrome.ServiceBuilder('~/Documents/chrome').build();
// chrome.setDefaultService(service);
function escapeBackslash(str) {
  return str.replace(/\\/g, '\\\\');
}

export async function startSearch(arg = null, event = null) {
  try {
    let resultList = [];
    const driver = new webdriver.Builder()
      .forBrowser('chrome')
      .setChromeOptions(options)
      .build();

    await driver.get('https://www.alibaba.com/');
    // await driver.get('http://localhost:5500/index.html');

    const imageSearchBtnXpath = `//*[@id="J_SC_header"]/header/div[3]/div/div/div[2]/div/div[1]/div/div[1]`;

    await driver.findElement(webdriver.By.xpath(imageSearchBtnXpath)).click();

    const fileUploadXpath = `//*[@id="image-upload-root"]/div/div/div[1]/div[2]/div/div/span`;

    const fileInput = `//*[@id="image-upload-file"]`;

    await driver.wait(
      until.elementLocated(webdriver.By.xpath(fileInput)),
      1000
    );

    const input = await driver.findElement(webdriver.By.xpath(fileInput));

    await driver.sleep(1000);

    console.log(escapeBackslash(arg?.file?.path));
    await input.sendKeys(escapeBackslash(arg?.file?.path));

    await driver.sleep(3000);

    const currentUrl = await driver.getCurrentUrl();

    const searchParams = new URLSearchParams(new URL(currentUrl).search); // URL의 쿼리스트링 가져오기

    const queryParams = {};
    for (const [key, value] of searchParams) {
      queryParams[key] = value;
    }

    //     console.log(queryParams);

    //     const preElement = document.querySelector('pre');

    // const data = preElement.textContent;
    //     const text = data.substring(0, data.length - 2).replace('result(', '');
    //     const test = JSON.parse(text);
    //     console.log(test);

    driver.close();

    await requestResults(queryParams.imageAddress, 1, 100, resultList, event);

    // driver.
  } catch (e) {
    console.log(e);
  }
}

async function requestResults(
  imageAddress,
  page,
  pageSize,
  resultList = [],
  event
) {
  const url = `https://open-s.alibaba.com/openservice/sourcenowImageSearchViewService?appKey=a5m1ismomeptugvfmkkjnwwqnwyrhpb1&appName=magellan&pageSize=${pageSize}&beginPage=${page}&imageType=oss&imageAddress=${encodeURIComponent(
    imageAddress
  )}&categoryId=66666666&region=13%2C487%2C19%2C539&language=ko&callback=result`;
  console.log(url);
  try {
    const result = await fetch(url, {
      headers: {
        referer: 'https://korean.alibaba.com/',
        'accept-language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
      },
    });

    let text = await result.text();
    let newText = text.trim();

    newText = newText.substring(0, newText.length - 2).replace('result(', '');

    const json = JSON.parse(newText);

    const totalCount = json?.data?.totalCount;
    const currency = json?.data?.localCurrency;
    const language = json?.data?.language;

    const offerList = json?.data?.offerList;

    // console.log(offerList.length);

    resultList = resultList.concat(offerList);

    // console.log(offerList, resultList);

    if (totalCount === 0 && page === 1) {
      // 검색 결과가 없을 경우 한번 더 보내봄. 이상허자나?
      await requestResults(imageAddress, page, pageSize, resultList, event);
      return;
    }

    if (totalCount > page * pageSize) {
      console.log('nextPage');
      await requestResults(imageAddress, page + 1, pageSize, resultList, event);
    } else {
      console.log('finalResult');
      const finalResult = {
        resultList,
        currency,
        language,
        totalCount,
        // json,
      };
      event.reply('search-image', finalResult);
    }
  } catch (e) {
    console.log(e);
  }
}
