---
title: Newbies' guide to Astro blog on AWS - Part 1 - Getting started
description: A beginners guide on how to build a basic Astro blog and deploy it on AWS - part 1.
pubDate: 2023-11-13T17:28:00
heroImage: ./01_hero_image.png
featured: true
tags:
  - astro
  - cloudfront
  - s3
  - aws
---

```sh
whoami
```

I'd like to welcome you to my blog and my very first post on it 🎉.
My name is Petar and today I'll outline various steps on how I got this blog to work on your device. We'll outline some of the requirements I had, what was I aiming to achieve, and what I learned throughout the process.
Without further ado, let's get started.

> Make a website where you can share various stuff regarding software development.

Okay. Sounds easy enough. Register on [Medium](https://medium.com/) and get started as a writer? Nope. Host a [WordPress](https://wordpress.com/) site, buy a blog plugin and a theme, and voila?

![We don't do that here](./we-dont-do-that-here.png)
How about overengineering a solution for a simple problem in the name of learning?
Hell yeah ✊.

### Let's start with app requirements.

So we're actually doing this the hard way? Okay.

Firstly, we have to cover some fundamental requirements we should have on our blog:

- The site should be pretty fast and SEO optimized.
  - So something that's prerendered (static) or server-side rendered suits this the best.
- Content should be easy to change.
  - Fair enough, we could use some CMS such as [Sanity](https://www.sanity.io/).
- Individual blog posts should be built on top of a shared layout so that I can change the design further down the line.
  - Hm, so we need to have these posts saved in a format that is standardized or we'll have to manually build the "post-viewer" using some library or god-forbid, do it completely manually 😱.

What we _won't_ have in the first version:

- Users.
- Liking/disliking posts.
- Commenting.

TL:DR; We'll use Astro with markdown posts. During the build process, we'll generate a static website from the markdown posts we want to show.

### Why Astro and Markdown?

**Markdown** is a markup language used to create formatted text using plain text. In a nutshell, it enables us to follow various standardized rules so that we can utilize various plugins that transform markdown to other formats such as HTML in our case. Also, it's a format used by my favorite note-taking app called [Obsidian](https://obsidian.md/).

So [Astro](https://astro.build/) is a web framework with some interesting features that we might explore in some other blog post. The following features are the most valuable ones for our little blog:

- Ability to generate static pages from markdown files.
- Type safety for our markdown posts.
- Various blog [examples and themes](https://astro.build/themes/?categories%5B%5D=blog) for us to _borrow_ 😶‍🌫️.
- Relatively easy to set up and deploy.
- I haven't played with it so now's a great opportunity 🙂.

### Why AWS?

Ah, the infamous [Amazon Web Services](https://aws.amazon.com/)...
Love them or hate them, they're the biggest _player_ in the web services space. They offer more than 250 services which should enable developers to develop and scale their applications much faster with minimum worries about the infrastructure.
A couple of weeks ago, I started my journey to become an AWS-certified developer. The first stop was the certificate called [AWS Certified Cloud Practitioner](https://aws.amazon.com/certification/certified-cloud-practitioner/). The certificate exam expects me to have a foundational and high-level understanding of AWS Cloud, services, and terminology. What better way to prepare for the exam than to build and deploy using AWS? So, as soon as I gathered a basic understanding of AWS S3, CloudFront, Route 53, and some other services to build and deploy my code, I wanted to try them out.

### Building the Astro blog.

To start building with Astro, head over to [official docs](https://docs.astro.build/en/install/auto/) and follow the setup guide. Keep in mind that you can speed up the process by using one of the templates from their [themes showcase](https://astro.build/themes/).
Since I wasn't smart enough to look for themes a bit longer than half a minute, I've initialized my project using the following command.

```sh
npm create astro@latest -- --template blog
```

My recommendation is to use all the default CLI options.

After creating a project, I recommend you set up [TailwindCSS](https://tailwindcss.com/) by using [@astrojs/tailwind](https://docs.astro.build/en/guides/integrations-guide/tailwind/) integration. The process is pretty straightforward and involves running the following command:

```sh
npx astro add tailwind
```

After that, you're pretty much set for development. The only thing I'd also recommend is to set up various linting rules and even _enforce_ them in some cases.

By running `npm run dev` and heading over to `http://localhost:4321`, you'll be able to find your Astro blog 🤩.

You can play around with styles and content if you want. I made myself a list of tasks (a lot of them are still active, check out the [GitHub issues](https://github.com/Petar-CV/personal-blog/issues) if you're interested).

The most important part of the app is our blog post management. Inside the `src/content/blog` you'll find blog posts in markdown format. Those blog posts will be used by Astro to build a static page for each of those posts. Keep in mind that the structure of that `/content/` folder represents how your router will work. So, for example, `src/content/blog/first-post.md` will translate into `<your_domain>/blog/first-post`. For this to work, you'll need to have [@astrojs/mdx](https://docs.astro.build/en/guides/integrations-guide/mdx/) plugin installed (it comes with the blog template).
Another cool thing is that Astro uses [Zod](https://zod.dev/) for schema validation. For example, in the `src/content` you'll find the `config.ts` that describes the data your markdown blog post should contain in the front matter.
For example, in my markdown posts, I can define whether I want a post to be featured on the blog's landing page by adding a key called `featured` to the `config.ts` file which then looks like this:

```typescript
import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
  // Type-check frontmatter using a schema
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      featured: z.boolean().default(false).optional(),
      // Transform string to Date object
      pubDate: z.coerce.date(),
      updatedDate: z.coerce.date().optional(),
      heroImage: image(),
      tags: z.array(z.string()).default([]).optional(),
    }),
});

export const collections = { blog };
```

Using that newly added property on the landing page was easy. I just had to place the following piece of code inside my `FeaturedPosts.astro` component and place HTML that's going to be rendered.

```typescript
---
import { getCollection } from 'astro:content';

const featuredPosts = (
  await getCollection('blog', ({ data }) => {
    return data.featured;
  })
)
  .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf())
  .slice(0, 3);
---
```

```html
{
  featuredPosts.length > 0 && (
    <section>
      <h2 class='mb-2'>Featured posts ✨</h2>

      <ul class='grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 md:gap-8'>
        {featuredPosts.map((featuredPost) => (
          <li>
            <a href={`/blog/${featuredPost.slug}/`}>
              <img
                class='transition-all duration-300 ease-in-out hover:-mt-3 hover:mb-3'
                src={featuredPost.data.heroImage}
                alt={featuredPost.data.title}
                transition:name={`post-${featuredPost.slug}`}
                transition:animate='initial'
              />
              <h4>{featuredPost.data.title}</h4>
              <p class='date'>
                <FormattedDate date={featuredPost.data.pubDate} />
              </p>
            </a>
          </li>
        ))}
      </ul>
    </section>
  )
}
```

The above-mentioned piece of code is the whole component that's going to render a mini-grid of 3 or fewer links to the featured blog posts. Isn't that nice?

If you want to find more information about Astro's content management or you're not sure about something mentioned before, I encourage you to go over to the [Astro Content Collections](https://docs.astro.build/en/guides/content-collections/) docs.

One more thing I highly encourage you to try out is Astro's implementation of the [View Transitions API](https://docs.astro.build/en/guides/view-transitions/). If you're reading this blog post, chances are you saw it when you tried to navigate between pages. It's a nice implementation and works pretty fine for my use case.
Do check out [Fireship's video](https://youtu.be/lsXqparnx24?si=RN19QadzZsjI-ZWs) on using the View Transitions API. However, keep in mind that some of the events he mentioned have been renamed since Astro released a stable version of their implementation, so be sure to check out the official Astro [docs](https://docs.astro.build/en/guides/view-transitions/#astropage-load).

> Although Astro provides fallback behavior, please keep in mind that this is experimental in some browsers so you should check the official [compatibility table](https://developer.mozilla.org/en-US/docs/Web/API/View_Transitions_API#browser_compatibility).

I don't want to dig any further into the framework itself since my use case is pretty straightforward but I truly hope you'll find some use case for this tool.

### Conclusion

To me, Astro is a fantastic tool that enables me to create simple components where I need them, without worrying about various stuff. Since I come from Angular, I'm used to changing 5-6 files just to add a simple component and render it on the page. With Astro, I don't have such problems.
One important thing to keep in mind is that I'm a newbie in the _Astro world_, and it's inevitable that on complex projects, you'll have a unique set of problems that could be traced to some decision this framework made for you.
In a nutshell, I dig this framework. It's simple and easy to use for some of my use cases.

Happy coding! 🐛
