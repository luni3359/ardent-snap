function drawLoadingScreen(ctx) {
    const lsc = data['loading-screen'];
    const lgw = data['loading-girls-waiting'];
    const lnl = data['loading-now-loading'];

    // background
    ctx.drawImage(menus, lsc.x, lsc.y, lsc.w, lsc.h, 0, 0, game.resolution.x, game.resolution.y);
    // girls waiting
    ctx.drawImage(menus, lgw.x, lgw.y, lgw.w, lgw.h, 416, 368, 125, 45);
    // now loading
    ctx.drawImage(menus, lnl.x, lnl.y, lnl.w, lnl.h, 474, 394, 125, 30);
}
