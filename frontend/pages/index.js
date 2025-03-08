import BlogList from '../components/BlogList';

export default function Home({ blogs }) {
  return (
    <>
      <BlogList blogs={blogs} />
    </>
  );
}

export async function getStaticProps() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/blogs`);
  const blogs = await res.json();
  return { props: { blogs }, revalidate: 10 }; // ISR
}

