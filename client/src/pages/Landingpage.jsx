import { useState } from 'react';
import { FileText } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import MultiInputForm from '../Components/Forms/Forms1';
import DocxViewer from '@/Components/Forms/EditText';
import EditText2 from '@/Components/Forms/EditText2';

const pdfData = [
  { id: 1, title: "Proposal Template_AR & IR", url: "/demo-data/proposaltemplate.pdf" },
  { id: 2, title: "Proposal Template_website", url: "./demo-data/proposaltemplate.pdf" },
  { id: 3, title: "Proposal Template_Video", url: "./demo-data/proposaltemplate.pdf" },
  { id: 4, title: "Proposal Template_demo4", url: "./demo-data/proposaltemplate.pdf" },
  { id: 5, title: "Proposal Template_demo5", url: "./demo-data/proposaltemplate.pdf" },
  { id: 6, title: "Proposal Template_demo6", url: "./demo-data/proposaltemplate.pdf" },
]

export default function Landingpage() {


    const[viewMandate, setViewMandate] = useState(true);
    const[activeMandate,setActiveMandate] = useState(null);
    const [mandateState, setMandateState] = useState(0);
   const setMandateEditingView = (pdf) => {
    setActiveMandate(pdf);
    setViewMandate(false)
   }
  return (
    <div className="container mx-auto py-8">
      {viewMandate?
      <>
      <h1 className="text-2xl font-bold mb-6">PDF Documents</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {pdfData.map((pdf) => (
          <Card key={pdf.id} className="flex flex-col">
            <CardHeader>
              <CardTitle>{pdf.title}</CardTitle>
            </CardHeader>
            <CardContent className="flex-grow flex items-center justify-center">
              <FileText size={64} className="text-gray-400" />
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={()=>setMandateEditingView(pdf)}>
                Edit Mandate
              </Button>
              {/* Open the URL in a new tab */}
              <Button onClick={() => window.open(pdf.url, '_blank')}>
                View Mandate
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
      </>:
      <div className='w-full'>
        <div className='flex justify-center my-4 gap-6  m-auto w-[60%]'>
            <Button 
              type="button" 
              onClick={()=>setMandateState(0)}
              className="w-[200px]  bg-yellow-500 hover:bg-yellow-600 text-black"
            >
              Make Mandate 
            </Button>
         <Button 
              type="button" 
              onClick={()=>setMandateState(1)}
              className="w-[200px]  bg-yellow-500 hover:bg-yellow-600 text-black"
            >
              Edit Mandate
            </Button>
        </div>
       
     {mandateState==0&& <MultiInputForm  activeMandate={activeMandate} setViewMandate={setViewMandate}/>}
     {/* {mandateState==1&& <DocxViewer  activeMandate={activeMandate} setViewMandate={setViewMandate}/>} */}
     <EditText2/>
      </div>
      }
    </div>
  )
}
