/*#
eval(compiler) {
    const files = compiler.matchFiles('**\/*', {
        excludeSelf:true
    })
    files.map(f => compiler.generate(`export * from ${f.relative()}`))
}
 */
//# sourceMappingURL=compiler.js.map