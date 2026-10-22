import { test, expect } from '@playwright/test';

test('Chinese independent exam and English collection administration',async({page},testInfo)=>{
  const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('/admin/');await page.getByLabel('Administrator password').fill('browser-test-password-only');await page.getByRole('button',{name:'Sign in',exact:true}).click();
  await expect(page.getByRole('heading',{name:'Study Management'})).toBeVisible();
  await page.getByLabel('Number',{exact:true}).fill('1');await page.getByLabel('Feedback condition').selectOption('fixed');await page.getByRole('button',{name:'Create codes'}).click();
  const code=await page.locator('td code').last().innerText();
  await page.screenshot({path:testInfo.outputPath('english-admin.png'),fullPage:true});
  await page.goto('/exam/');await page.getByLabel('参与码',{exact:true}).fill(code);await page.getByRole('button',{name:'进入研究'}).click();
  await page.getByLabel('年龄组').selectOption('18-24');await page.getByLabel('日语水平').selectOption('N4');await page.getByLabel('AI 学习经验').selectOption('None');await page.getByRole('checkbox').check();await page.getByRole('button',{name:'同意并进入'}).click();await page.getByRole('button',{name:'开始前测'}).click();
  await expect(page.getByRole('timer')).toBeVisible();
  await page.screenshot({path:testInfo.outputPath('chinese-exam.png'),fullPage:true});
  const first=page.locator('.question-body input[type=radio]');if(await first.count())await first.first().check();else await page.locator('.question-body textarea').fill('予約');
  await page.getByRole('button',{name:'保存',exact:true}).click();await expect(page.getByText(/已保存到服务器/)).toBeVisible();
  await page.reload();await page.getByRole('button',{name:'进入研究'}).click();await page.getByRole('button',{name:'继续前测'}).click();
  await expect(page.locator('.question-body input[type=radio]:checked')).toHaveCount(1);
  for(let i=0;i<15;i++){
    const radio=page.locator('.question-body input[type=radio]');if(await radio.count())await radio.first().check();else await page.locator('.question-body textarea').fill('研究計画について相談したいです。明日の午後はいかがですか。');
    if(i<14)await page.getByRole('button',{name:'下一题'}).click();
  }
  page.once('dialog',d=>d.accept());await page.getByRole('button',{name:'提交答卷'}).click();
  await expect(page.getByRole('cell',{name:'已提交',exact:true})).toHaveCount(1);
  await expect(page.getByRole('button',{name:'开始答题'}).first()).toBeDisabled();
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1);expect(overflow).toBe(false);
  await page.goto('/admin/');await expect(page.getByRole('heading',{name:'Study Management'})).toBeVisible();await page.getByRole('button',{name:'Scoring',exact:true}).click();await expect(page.getByRole('heading',{name:'Human scoring queue'})).toBeVisible();
  await page.getByLabel('Rater ID').fill('R1');await page.locator('.grading-item').first().getByRole('combobox',{name:'Score',exact:true}).selectOption('3');await page.locator('.grading-item').first().getByRole('button',{name:'Save rating'}).click();
  await page.getByRole('button',{name:'Exports',exact:true}).click();const download=page.waitForEvent('download');await page.getByRole('button',{name:'Results CSV',exact:true}).click();expect((await download).suggestedFilename()).toBe('mp6-collected-results.csv');
  expect(errors).toEqual([]);
});
