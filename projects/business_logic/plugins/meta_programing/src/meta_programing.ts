/**
#generator(generate, fileMatcher) {
    const files = fileMatcher.match('**\/*', {
        excludeSelf:true
    })
    files.map(f => generate(`export * from ${f.relative()}`))
}
 */
