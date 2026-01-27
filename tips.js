
// ## waiting  function
await new Promise(r => setTimeout(r, 3000));
await new Promise(resolve => setTimeout(resolve, 3000));


    // ## get all order list by seasonYear-active
    const seasonYearActive = (await ShareFunc.getControlAppseasonYearActive()).seasonYearActive;
    // console.log(seasonYearActive);
    const orderStatusArr = ['open'];
    const orderIDss = await ShareFunc.getOrderIDsBySeasonYear(companyID, orderStatusArr, seasonYearActive);
    // console.log(orderIDss);
    let orderIDs = [];
    orderIDss.forEach(i=>orderIDs.push(i.orderID));
    // console.log('orderIDs ====', orderIDs);