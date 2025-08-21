import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

const RulesPage = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
      {/* Upload Rule */}
      <Card className="shadow-lg rounded-2xl">
        <CardHeader>
          <CardTitle>Upload Rule</CardTitle>
        </CardHeader>
        <CardContent>
          <Button className="w-full">Upload</Button>
        </CardContent>
      </Card>

      {/* Download Rules */}
      <Card className="shadow-lg rounded-2xl">
        <CardHeader>
          <CardTitle>Download Rules</CardTitle>
        </CardHeader>
        <CardContent>
          <Button className="w-full">Download</Button>
        </CardContent>
      </Card>

      {/* Share Rules */}
      <Card className="shadow-lg rounded-2xl">
        <CardHeader>
          <CardTitle>Share Rules</CardTitle>
        </CardHeader>
        <CardContent>
          <Button className="w-full">Share</Button>
        </CardContent>
      </Card>
    </div>
  )
}

export default RulesPage
