import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const InputForm = () => {
  const [assetType, setAssetType] = useState("car");
  const [rentalType, setRentalType] = useState("drop");
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [vehicle, setVehicle] = useState("");
  const [fromLocation, setFromLocation] = useState("");
  const [toLocation, setToLocation] = useState("");
  const [price, setPrice] = useState("");
  const [fuelCost, setFuelCost] = useState("");
  const [driverCost, setDriverCost] = useState("");
  const [trips, setTrips] = useState("1");
  const [days, setDays] = useState("1");
  const [salesAmount, setSalesAmount] = useState("");

  const cars = [
    { name: "Veloz 2021", plate: "B 2622 POI" },
    { name: "Veloz 2019", plate: "DR 1019 KG" },
    { name: "Avanza 2023", plate: "Z 1494 TQ" },
    { name: "Avanza 2022", plate: "B 2206 POT" },
    { name: "Avanza 2018", plate: "AB 1375 KJ" },
    { name: "Avanza 2019", plate: "B 2191 TIH" },
    { name: "Avanza 2023", plate: "D 1217 UBM" },
  ];

  const speedboats = [
    { name: "Speed Boat Broo Meet" },
    { name: "Speed Boat Bintang Laut" },
    { name: "Speed Boat BJT 01" },
    { name: "Speed Boat Speedy91" },
  ];

  const calculateDailyCash = () => {
    const tripsNum = parseInt(trips) || 0;
    const daysNum = parseInt(days) || 0;

    if (assetType === "car") {
      if (rentalType === "drop") {
        return tripsNum * 10000;
      } else {
        // harian
        return daysNum * 10000;
      }
    } else if (assetType === "speedboat") {
      return tripsNum * 10000;
    } else if (assetType === "restaurant") {
      return 10000;
    }
    return 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!date) {
      alert("Tanggal harus diisi");
      return;
    }

    const formattedDate = format(date, "yyyy-MM-dd");
    const dailyCash = calculateDailyCash();

    let formData: any = {
      date: formattedDate,
      assetType,
      dailyCash,
    };

    if (assetType === "car") {
      if (!vehicle || !price) {
        alert("Semua field harus diisi");
        return;
      }

      formData = {
        ...formData,
        vehicle,
        rentalType,
        price: parseFloat(price),
      };

      if (rentalType === "drop") {
        if (!fromLocation || !toLocation) {
          alert("Lokasi awal dan tujuan harus diisi");
          return;
        }
        formData = {
          ...formData,
          fromLocation,
          toLocation,
          fuelCost: parseFloat(fuelCost) || 0,
          driverCost: parseFloat(driverCost) || 0,
          trips: parseInt(trips),
        };
      } else {
        // harian
        formData = {
          ...formData,
          days: parseInt(days),
        };
      }
    } else if (assetType === "speedboat") {
      if (!vehicle || !trips || !price) {
        alert("Semua field harus diisi");
        return;
      }
      formData = {
        ...formData,
        vehicle,
        price: parseFloat(price),
        trips: parseInt(trips),
      };
    } else if (assetType === "restaurant") {
      if (!salesAmount) {
        alert("Jumlah penjualan harus diisi");
        return;
      }
      formData = {
        ...formData,
        salesAmount: parseFloat(salesAmount),
      };
    }

    // Save to localStorage
    const existingData = localStorage.getItem("transactions");
    const dataArray = existingData ? JSON.parse(existingData) : [];
    // Add id and format data to match ReportsView expected format
    const transaction = {
      id: Date.now().toString(),
      date: formattedDate,
      assetType,
      assetName: vehicle || "Resto",
      rentalType: assetType === "car" ? rentalType : undefined,
      route:
        assetType === "car" && rentalType === "drop"
          ? `${fromLocation} - ${toLocation}`
          : "",
      price:
        assetType === "car" || assetType === "speedboat"
          ? parseFloat(price)
          : parseFloat(salesAmount) || 0,
      operationalCosts: {
        fuel: parseFloat(fuelCost) || 0,
        driver: parseFloat(driverCost) || 0,
      },
      trips: parseInt(trips) || 1,
      days: parseInt(days) || 1,
      dailyCash,
    };
    dataArray.push(transaction);
    localStorage.setItem("transactions", JSON.stringify(dataArray));

    // Reset form
    setVehicle("");
    setFromLocation("");
    setToLocation("");
    setPrice("");
    setFuelCost("");
    setDriverCost("");
    setTrips("1");
    setDays("1");
    setSalesAmount("");

    alert("Data berhasil disimpan!");
  };

  return (
    <Card className="w-full bg-white">
      <CardHeader className="px-3 sm:px-6 py-3 sm:py-4">
        <CardTitle className="text-center text-gray-800 text-lg sm:text-xl">
          Input Data Transaksi
        </CardTitle>
      </CardHeader>
      <CardContent className="px-3 sm:px-6">
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="asset-type">Jenis Aset</Label>
              <Tabs
                defaultValue="car"
                value={assetType}
                onValueChange={setAssetType}
                className="w-full"
              >
                <TabsList className="grid grid-cols-3 w-full">
                  <TabsTrigger
                    value="car"
                    className="text-xs sm:text-sm py-1.5 sm:py-2"
                  >
                    Mobil
                  </TabsTrigger>
                  <TabsTrigger
                    value="speedboat"
                    className="text-xs sm:text-sm py-1.5 sm:py-2"
                  >
                    Speedboat
                  </TabsTrigger>
                  <TabsTrigger
                    value="restaurant"
                    className="text-xs sm:text-sm py-1.5 sm:py-2"
                  >
                    Resto
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {assetType === "car" && (
              <div className="space-y-2">
                <Label htmlFor="rental-type">Jenis Rental</Label>
                <Tabs
                  defaultValue="drop"
                  value={rentalType}
                  onValueChange={setRentalType}
                  className="w-full"
                >
                  <TabsList className="grid grid-cols-2 w-full">
                    <TabsTrigger
                      value="drop"
                      className="text-xs sm:text-sm py-1.5 sm:py-2"
                    >
                      Drop
                    </TabsTrigger>
                    <TabsTrigger
                      value="harian"
                      className="text-xs sm:text-sm py-1.5 sm:py-2"
                    >
                      Harian
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="date">Tanggal</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : <span>Pilih tanggal</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {(assetType === "car" || assetType === "speedboat") && (
              <div className="space-y-2">
                <Label htmlFor="vehicle">
                  {assetType === "car" ? "Mobil" : "Speedboat"}
                </Label>
                <Select value={vehicle} onValueChange={setVehicle}>
                  <SelectTrigger>
                    <SelectValue
                      placeholder={`Pilih ${assetType === "car" ? "mobil" : "speedboat"}`}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {assetType === "car"
                      ? cars.map((car, index) => (
                          <SelectItem
                            key={index}
                            value={`${car.name} (${car.plate})`}
                          >
                            {car.name} ({car.plate})
                          </SelectItem>
                        ))
                      : speedboats.map((boat, index) => (
                          <SelectItem key={index} value={boat.name}>
                            {boat.name}
                          </SelectItem>
                        ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {assetType === "car" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="price">Harga Sewa (Rp)</Label>
                  <Input
                    id="price"
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="Masukkan harga sewa"
                  />
                </div>

                {rentalType === "drop" ? (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="from-location">Lokasi Awal</Label>
                      <Input
                        id="from-location"
                        value={fromLocation}
                        onChange={(e) => setFromLocation(e.target.value)}
                        placeholder="Masukkan lokasi awal"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="to-location">Lokasi Tujuan</Label>
                      <Input
                        id="to-location"
                        value={toLocation}
                        onChange={(e) => setToLocation(e.target.value)}
                        placeholder="Masukkan lokasi tujuan"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="fuel-cost">Biaya Bensin (Rp)</Label>
                      <Input
                        id="fuel-cost"
                        type="number"
                        value={fuelCost}
                        onChange={(e) => setFuelCost(e.target.value)}
                        placeholder="Masukkan biaya bensin"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="driver-cost">Ongkos Sopir (Rp)</Label>
                      <Input
                        id="driver-cost"
                        type="number"
                        value={driverCost}
                        onChange={(e) => setDriverCost(e.target.value)}
                        placeholder="Masukkan ongkos sopir"
                      />
                    </div>
                  </>
                ) : (
                  <div className="space-y-2">
                    <Label htmlFor="days">Jumlah Hari</Label>
                    <Input
                      id="days"
                      type="number"
                      min="1"
                      value={days}
                      onChange={(e) => setDays(e.target.value)}
                      placeholder="Masukkan jumlah hari"
                    />
                  </div>
                )}
              </>
            )}

            {((assetType === "car" && rentalType === "drop") ||
              assetType === "speedboat") && (
              <div className="space-y-2">
                <Label htmlFor="trips">Jumlah Perjalanan</Label>
                <Input
                  id="trips"
                  type="number"
                  min="1"
                  value={trips}
                  onChange={(e) => setTrips(e.target.value)}
                  placeholder="Masukkan jumlah perjalanan"
                />
              </div>
            )}

            {assetType === "speedboat" && (
              <div className="space-y-2">
                <Label htmlFor="price">Harga Sewa (Rp)</Label>
                <Input
                  id="price"
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="Masukkan harga sewa"
                />
              </div>
            )}

            {assetType === "restaurant" && (
              <div className="space-y-2">
                <Label htmlFor="sales-amount">Jumlah Penjualan (Rp)</Label>
                <Input
                  id="sales-amount"
                  type="number"
                  value={salesAmount}
                  onChange={(e) => setSalesAmount(e.target.value)}
                  placeholder="Masukkan jumlah penjualan"
                />
              </div>
            )}

            <div className="p-4 bg-blue-50 rounded-md">
              <p className="text-sm font-medium text-blue-800">
                Uang Kas: Rp{calculateDailyCash().toLocaleString()}
              </p>
              <p className="text-xs text-blue-600 mt-1">
                {assetType === "car" &&
                  rentalType === "drop" &&
                  "Rp10.000 per perjalanan"}
                {assetType === "car" &&
                  rentalType === "harian" &&
                  "Rp10.000 per hari"}
                {assetType === "speedboat" && "Rp10.000 per perjalanan"}
                {assetType === "restaurant" && "Rp10.000 per hari"}
              </p>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full bg-blue-500 hover:bg-blue-600 text-sm sm:text-base py-2 sm:py-3"
          >
            Simpan Data
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default InputForm;
