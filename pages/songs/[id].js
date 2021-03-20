import Song from '../../components/song'

export async function getServerSideProps(context) {
  const { req, query } = context;

  const protocol = req.headers['x-forwarded-proto'] || 'http'
  const baseUrl = req ? `${protocol}://${req.headers.host}` : ''
  const res = await fetch(`${baseUrl}/api/songs/${query.id}`)
  const data = await res.json()

  return { props: { data } }
}

export default function SongPage({ data }) {
  return <Song data={data} />
}
