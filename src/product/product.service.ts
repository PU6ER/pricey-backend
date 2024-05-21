import { Injectable } from '@nestjs/common';
import * as puppeteer from 'puppeteer';

@Injectable()
export class ProductService {
  async getPerekrestokPrice(productName: string) {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();

    try {
      await page.goto(
        `https://www.perekrestok.ru/cat/search?search=${productName}`,
        {
          waitUntil: 'networkidle2',
        },
      );
      console.log('product name:', productName);
      console.log('Navigating to Perekrestok...');

      // Вводим название продукта в строку поиска
      //   await page.type('input[placeholder="Поиск по каталогу"]', productName);
      //   await page.keyboard.press('Enter');

      console.log('Typing product name and waiting for results...');
      //   console.log(await page.content());

      // Ждём загрузку результатов
      await page.waitForSelector('.product-card');
      //   await page.waitForNavigation();
      console.log('Navigation to search page complete...');

      console.log('Extracting price...');

      const priceList = await page.evaluate((productName) => {
        const productCards = document.querySelectorAll('.product-card');
        const productList: {
          shop: string;
          title: string;
          price: string;
          link: string;
          imageUrl: string;
        }[] = Array.from(productCards)
          .map((card) => {
            const priceElement = card.querySelector('.price-new');
            const titleElement = card.querySelector('.product-card__title');
            const imageUrl = card
              .querySelector('.product-card__image')
              .getAttribute('src');
            const link =
              'https://www.perekrestok.ru' +
              card.querySelector('.product-card__link').getAttribute('href');

            return {
              shop: 'perekrestok',
              title: titleElement.textContent,
              price: priceElement.textContent.slice(4),
              imageUrl: imageUrl,
              link: link,
            };
          })
          .slice(0, -6)
          .sort(
            (a, b) =>
              parseInt(a.price.replace(/[^\d,]/g, '').replace(',', '.'), 10) -
              parseInt(b.price.replace(/[^\d,]/g, '').replace(',', '.'), 10),
          );
        return productList;
      }, productName);

      // Извлекаем цену продукта
      const price = await page.evaluate(() => {
        const productCard = document.querySelector('.product-card__content');
        if (productCard !== null) {
          if (productCard) {
            const priceElement = productCard.querySelector('.price-new');
            const titleElement = productCard.querySelector(
              '.product-card__title',
            );
            return priceElement && titleElement
              ? {
                  title: titleElement.textContent,
                  price: priceElement.textContent,
                }
              : null;
          }
        } else {
          return 'Nothing to select';
        }
        return null;
      });

      await browser.close();
      console.log(price);
      //   return price;
      return priceList;
    } catch (error) {
      console.error(error);
      await browser.close();
      throw error;
    }
  }
}
