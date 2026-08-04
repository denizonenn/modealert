"use client"

import { useEffect, useState } from "react"

import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AlertTriangle, RefreshCw } from "lucide-react"

interface LiveEvent {
  id: string
  title: string
  status: "LIVE" | "UPCOMING" | "TRACKING" | "ENDED"
  startDate: string
  endDate: string
  hubType: string
}

interface CurrentStatusResponse {
  success: boolean
  liveEvents?: LiveEvent[]
  upcomingEvents?: LiveEvent[]
  pbeCandidates?: LiveEvent[]
  pbeCheckFailed?: boolean
  checkedAt?: string
  error?: string
}

function formatDate(value: string) {
  return new Date(value).toLocaleString("tr-TR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function EventRow({ event }: { event: LiveEvent }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-white/10 py-3 last:border-0">
      <div>
        <p className="font-medium">{event.title}</p>
        <p className="text-xs text-zinc-500">{event.hubType}</p>
      </div>
      <div className="text-right text-xs text-zinc-400">
        <p>Başlangıç: {formatDate(event.startDate)}</p>
        <p>Bitiş: {formatDate(event.endDate)}</p>
      </div>
    </div>
  )
}

export default function LivePage() {
  const [data, setData] = useState<CurrentStatusResponse | null>(null)
  const [loading, setLoading] = useState(true)

  async function load() {
    setLoading(true)

    try {
      const response = await fetch("/api/providers/communitydragon/current")
      const json: CurrentStatusResponse = await response.json()
      setData(json)
    } catch {
      setData({ success: false, error: "İstek başarısız oldu." })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void Promise.resolve().then(load)
  }, [])

  return (
    <main className="min-h-screen bg-black text-white">
      <Navbar />

      <section className="mx-auto max-w-5xl px-6 py-16">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">
              CommunityDragon — Live Check
            </p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
              League of Legends&apos;ta Şu An Ne Var?
            </h1>
          </div>

          <Button
            variant="ghost"
            className="border border-white/10 text-white hover:bg-white/10"
            onClick={load}
            disabled={loading}
          >
            <RefreshCw className={loading ? "h-4 w-4 animate-spin" : "h-4 w-4"} />
            Yenile
          </Button>
        </div>

        {data?.checkedAt && (
          <p className="mt-2 text-xs text-zinc-500">
            Son kontrol: {formatDate(data.checkedAt)} · Kaynak: raw.communitydragon.org (live + pbe)
          </p>
        )}

        {data && !data.success && (
          <Card className="mt-8 border-red-500/30 bg-red-500/10 text-white">
            <CardContent className="flex items-center gap-3 py-4">
              <AlertTriangle className="h-5 w-5 text-red-400" />
              <p className="text-sm">{data.error ?? "Veri alınamadı."}</p>
            </CardContent>
          </Card>
        )}

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <Card className="border-white/10 bg-white/5 text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Badge className="bg-emerald-500 text-black">LIVE</Badge>
                Şu An Aktif
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading && !data ? (
                <p className="text-sm text-zinc-500">Yükleniyor...</p>
              ) : data?.liveEvents?.length ? (
                data.liveEvents.map((event) => <EventRow key={event.id} event={event} />)
              ) : (
                <p className="text-sm text-zinc-500">Şu anda aktif event bulunamadı.</p>
              )}
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-white/5 text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Badge variant="secondary">UPCOMING</Badge>
                Yaklaşanlar
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading && !data ? (
                <p className="text-sm text-zinc-500">Yükleniyor...</p>
              ) : data?.upcomingEvents?.length ? (
                data.upcomingEvents.map((event) => <EventRow key={event.id} event={event} />)
              ) : (
                <p className="text-sm text-zinc-500">Yaklaşan planlı event bulunamadı.</p>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="mt-6 border-white/10 bg-white/5 text-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Badge variant="outline" className="border-amber-400 text-amber-400">
                PBE
              </Badge>
              PBE&apos;de Olup Live&apos;da Olmayanlar (Erken Sinyal)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data?.pbeCheckFailed ? (
              <p className="text-sm text-zinc-500">
                PBE kontrolü şu an başarısız oldu (PBE sunucusu geçici olarak erişilemez olabilir).
              </p>
            ) : loading && !data ? (
              <p className="text-sm text-zinc-500">Yükleniyor...</p>
            ) : data?.pbeCandidates?.length ? (
              data.pbeCandidates.map((event) => <EventRow key={event.id} event={event} />)
            ) : (
              <p className="text-sm text-zinc-500">
                Şu anda PBE&apos;de olup live&apos;da henüz olmayan bir event yok. Bu normal —
                CDragon&apos;ın event-hub dosyası genelde season pass / battle pass gibi önceden
                planlanmış içerikleri kapsıyor.
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="mt-6 border-white/10 bg-white/5 text-white">
          <CardHeader>
            <CardTitle>URF Durumu — Neden Burada Görünmüyor?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-zinc-400">
            <p>
              URF (Ultra Rapid Fire), CommunityDragon&apos;ın{" "}
              <code className="rounded bg-black/40 px-1">queues.json</code> dosyasında her zaman
              tanımlı duruyor — bu bir &quot;aktif&quot; sinyali değil, sadece &quot;bu queue tipi
              var&quot; demek. Riot, URF&apos;ün ne zaman açık olduğunu hiçbir public ya da
              datamined dosyada önceden yayınlamıyor; bunu sadece patch notlarında veya istemci
              içi banner ile (rotasyon açıldığı anda) duyuruyor.
            </p>
            <p>
              Bu yüzden URF için gerçek &quot;erken uyarı&quot; şu an teknik olarak mümkün değil —
              bu bizim eksiğimiz değil, Riot&apos;un bu veriyi hiçbir yerde önceden
              yayınlamamasından kaynaklanıyor. Yukarıdaki PBE/Live karşılaştırması, Arena veya
              Swarm gibi kendi &quot;hub dosyası&quot; olan modlar için gerçek erken sinyal verir.
            </p>
          </CardContent>
        </Card>
      </section>

      <Footer />
    </main>
  )
}
