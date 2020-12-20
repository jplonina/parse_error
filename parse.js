#!/usr/bin/env node

let sorting = require('postcss-sorting')
let postcss = require('postcss')
let sugarss = require('sugarss')
let recess = require('stylelint-config-recess-order')
let styled = require('postcss-styled')
let path = require('path')
let fs = require('fs')

let file = process.argv[2]
if (file === '--') file = process.argv[3]

if (typeof file === 'undefined') {
  process.stderr.write('Error: Pass file to sort in first argument\n')
  process.exit(1)
}

if (!fs.existsSync(file)) {
  process.stderr.write(`Error: File ${file} doesn’t exists\n`)
  process.exit(1)
}

let order = []
for (let i of recess.rules['order/properties-order']) {
  order = order.concat(i.properties)
}

let sorter = postcss([sorting({ 'properties-order': order })])

fs.readFile(file, (err, source) => {
  if (err) {
    process.stderr.write(err.message)
    process.exit(1)
  }

  let ext = path.extname(file)
  let fixed
  if (ext === '.js') {
    let roots = styled.parse(source)
    roots.nodes.forEach(root => {
      let fakeRule = postcss.rule({ selector: 'a', nodes: root.nodes })
      let fakeRoot = postcss.root({ nodes: [fakeRule] })
      root.nodes = sorter.process(fakeRoot, {
        from: file,
        to: file
      }).root.nodes[0].nodes
    })
    fixed = roots.toString()
  } else {
    fixed = sorter.process(source, {
      syntax: ext === '.sss' ? sugarss : false,
      from: file,
      to: file
    }).css
  }

  if (fixed !== source) {
    fs.writeFile(file, fixed, err2 => {
      if (err2) {
        process.stderr.write(err2.message)
        process.exit(1)
      }
    })
  }
})
