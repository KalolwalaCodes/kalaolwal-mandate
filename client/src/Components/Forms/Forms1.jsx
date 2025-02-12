import { useState } from "react";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/lable";

export default function MultiInputForm({
  activeMandate,
  setViewMandate,
  formData,
  setFormData,
}) {
  const handleChange = async (e) => {
    const { id, value, type, files } = e.target;

    if (type === "file") {
      try {
        const url= await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(files[0]);
          
          reader.onload = () => resolve(reader.result);
          reader.onerror = (error) => reject(error);
        });
        setFormData((prev) => ({
          ...prev,
          [id]: url,
        }));
      } catch (e) {
        alert("Failed to upload stamp. Please try again.");
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        [id]: value,
      }));
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const formDataObj = {}; // Initialize a plain object to hold the form data
      Object.keys(formData).forEach((key) => {
        formDataObj[key] = formData[key];
      });

      const response = await fetch("http://localhost:4000/api/download", {
        method: "POST",
        headers: {
          "Content-Type": "application/json", // Set content type to JSON
        },
        body: JSON.stringify({ newText: formDataObj }), // Send formData as a plain object
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        window.open(url, "_blank");
      } else {
        console.error("Failed to download the file");
      }
    } catch (error) {
      console.error("Error during form submission:", error);
    }
  };

  return (
    <>
      <button
        onClick={() => setViewMandate(true)}
        className="bg-yellow-500 hover:bg-yellow-600 text-black rounded-md font-medium px-[20px] py-[6px] absolute top-[10px]"
      >
        Homepage
      </button>
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">
            {activeMandate.title}
          </CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="kaplNumber">KAPL/__/25-26</Label>
                <Input
                  id="kaplNumber"
                  type="text"
                  value={formData.kaplNumber}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="agreementDate">Agreement Date</Label>
                <Input
                  id="agreementDate"
                  type="date"
                  value={formData.agreementDate}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="clientName">Client Name</Label>
                <Input
                  id="clientName"
                  type="text"
                  value={formData.clientName}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="clientOffice">Client Office</Label>
                <Input
                  id="clientOffice"
                  type="text"
                  value={formData.clientOffice}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="clientBusiness">Client Business</Label>
                <Input
                  id="clientBusiness"
                  type="text"
                  value={formData.clientBusiness}
                  onChange={handleChange}
                />
              </div>
              {/* <div className="space-y-2">
                <Label htmlFor="onBehalfOf">On Behalf Of</Label>
                <Input
                  id="onBehalfOf"
                  type="text"
                  value={formData.onBehalfOf}
                  onChange={handleChange}
                />
              </div> */}
              <div className="space-y-2">
                <Label htmlFor="arbitrationPlace">
                  Seat or Place of Arbitration
                </Label>
                <Input
                  id="arbitrationPlace"
                  type="text"
                  value={formData.arbitrationPlace}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="makerName">Maker Name</Label>
                <Input
                  id="makerName"
                  type="text"
                  value={formData.makerName}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="makerDesignation">Maker Designation</Label>
                <Input
                  id="makerDesignation"
                  type="text"
                  value={formData.makerDesignation}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signatureDate">Signature Date</Label>
                <Input
                  id="signatureDate"
                  type="date"
                  value={formData.signatureDate}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stamp">Stamp</Label>
                <Input id="stamp" type="file" onChange={handleChange} />
              </div>
            </div>
            {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Price</Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gstPercentage">% of GST</Label>
                <Input
                  id="gstPercentage"
                  type="number"
                  value={formData.gstPercentage}
                  onChange={handleChange}
                />
              </div>
            </div> */}
          </CardContent>
          <div className="flex w-full">
            <CardFooter className="w-[49%]">
              <Button type="submit" className="w-full">
                Download PDF
              </Button>
            </CardFooter>
            <CardFooter className="w-[49%]">
              <Button type="button" className="w-full">
                Preview Files
              </Button>
            </CardFooter>
          </div>
        </form>
      </Card>
    </>
  );
}
