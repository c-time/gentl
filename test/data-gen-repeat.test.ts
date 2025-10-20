import { test } from 'node:test';
import { type GentlJInput, type GentlJOptions, process }  from "../src/index.ts";
import { format as f } from "prettier";
import formatHtml from "./formatHtml.ts";
import { createTestOptions } from './test-helper.ts';

const options: Partial<GentlJOptions> = createTestOptions({
  rootParserType: "childElement",
});

test("basic", async ({assert})=> {
  const result = await process(
    {
      html: `<template data-gen-scope="" data-gen-repeat="names" data-gen-repeat-name="name">
  <div data-gen-text="name">Test</div>
</template>`,
      data: { names: ["Name1", "Name2", "Name3"] },
    },
    options
  );

  assert.equal(
    await formatHtml(result.html),
    await formatHtml(
      `<template data-gen-scope="" data-gen-repeat="names" data-gen-repeat-name="name">
  <div data-gen-text="name">Test</div>
</template>
<div data-gen-cloned="">Name1</div>
<div data-gen-cloned="">Name2</div>
<div data-gen-cloned="">Name3</div>`
    )
  );
});

test("refer object property", async ({assert})=> {
  const result = await process(
    {
      html: `<template data-gen-scope="" data-gen-repeat="people" data-gen-repeat-name="person">
  <div data-gen-text="person.name">Test</div>
</template>`,
      data: {
        people: [{ name: "Name1" }, { name: "Name2" }, { name: "Name3" }],
      },
    },
    options
  );

  assert.equal(
    await formatHtml(result.html),
    await formatHtml(
      `<template data-gen-scope="" data-gen-repeat="people" data-gen-repeat-name="person">
  <div data-gen-text="person.name">Test</div>
</template>
<div data-gen-cloned="">Name1</div>
<div data-gen-cloned="">Name2</div>
<div data-gen-cloned="">Name3</div>`
    )
  );
});

//     test("refer array property", async ({assert})=> {
//       const result = await process({
//         html: `<template data-gen-scope="" data-gen-repeat="people" data-gen-repeat-name="person">
//   <div data-gen-text="person[0]">Test</div>
// </template>`,
//         data: {
//           people: [
//             ["Name1", "Addr1"],
//             ["Name2", "Addr2"],
//             ["Name3", "Addr3"],
//           ],
//         },
//       });

//       assert.equal(await formatHtml(result.html),""
//         await formatHtml(
//           `<template data-gen-scope="" data-gen-repeat="people" data-gen-repeat-name="person">
//   <div data-gen-text="person[1]">Test</div>
// </template>
// <div data-gen-cloned="">Addr1</div>
// <div data-gen-cloned="">Addr2</div>
// <div data-gen-cloned="">Addr3</div>`
//         )
//       );
//     });

test("nested repeat", async ({assert})=> {
  const result = await process(
    {
      html: `<template data-gen-scope="" data-gen-repeat="people" data-gen-repeat-name="person">
  <div>
    <div data-gen-text="person.name">Name</div>
    <template data-gen-scope="" data-gen-repeat="person.hobbies" data-gen-repeat-name="hobby">
      <div>
        <div data-gen-text="hobby">Hobby</div>
      </div>
    </template>
  </div>
</template>`,
      data: {
        people: [
          { name: "Name1", hobbies: ["Book", "Movie", "Music"] },
          { name: "Name2", hobbies: ["Anime", "Sports"] },
        ],
      },
    },
    options
  );

  assert.equal(
    await formatHtml(result.html),
    await formatHtml(
      `<template data-gen-scope="" data-gen-repeat="people" data-gen-repeat-name="person">
  <div>
    <div data-gen-text="person.name">Name</div>
    <template data-gen-scope="" data-gen-repeat="person.hobbies" data-gen-repeat-name="hobby">
      <div>
        <div data-gen-text="hobby">Hobby</div>
      </div>
    </template>
  </div>
</template>
<div data-gen-cloned="">
  <div>Name1</div>
    <div>
      <div>Book</div>
    </div>
    <div>
      <div>Movie</div>
    </div>
    <div>
      <div>Music</div>
    </div>
  </div>
  <div data-gen-cloned="">
    <div>Name2</div>
    <div>
      <div>Anime</div>
    </div>
    <div>
      <div>Sports</div>
    </div>
  </div>`
    )
  );
});

test("nested repeat and multiple elements", async ({assert})=> {
  const result = await process(
    {
      html: `<template data-gen-scope="" data-gen-repeat="people" data-gen-repeat-name="person">
  <div>
    <p>title</p>
    <div data-gen-text="person.name">Name</div>
    <template data-gen-scope="" data-gen-repeat="person.hobbies" data-gen-repeat-name="hobby">
      <div>
        <div data-gen-text="hobby">Hobby</div>
        <p>message</p>
      </div>
    </template>
  </div>
</template>`,
      data: {
        people: [
          { name: "Name1", hobbies: ["Book", "Movie", "Music"] },
          { name: "Name2", hobbies: ["Anime", "Sports"] },
        ],
      },
    },
    options
  );

  assert.equal(
    await formatHtml(result.html),
    await formatHtml(
      `<template data-gen-scope="" data-gen-repeat="people" data-gen-repeat-name="person">
  <div>
    <p>title</p>
    <div data-gen-text="person.name">Name</div>
    <template data-gen-scope="" data-gen-repeat="person.hobbies" data-gen-repeat-name="hobby">
      <div>
        <div data-gen-text="hobby">Hobby</div>
        <p>message</p>
      </div>
    </template>
  </div>
</template>
<div data-gen-cloned="">
  <p>title</p>
  <div>Name1</div>
    <div>
      <div>Book</div>
      <p>message</p>
    </div>
    <div>
      <div>Movie</div>
      <p>message</p>
    </div>
    <div>
      <div>Music</div>
      <p>message</p>
    </div>
  </div>
  <div data-gen-cloned="">
    <p>title</p>
    <div>Name2</div>
    <div>
      <div>Anime</div>
      <p>message</p>
    </div>
    <div>
      <div>Sports</div>
      <p>message</p>
    </div>
  </div>`
    )
  );
});



